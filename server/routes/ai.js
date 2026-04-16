const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Listing = require('../models/Listing');
const { chatWithGroq } = require('../utils/groqClient');

// POST /api/ai/chat
router.post('/chat', verifyToken, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'message is required' } });
    }

    // Step 1: Extract structured search params from user message
    const extractionPrompt = `You are a property search assistant for ReSpace, an Indian commercial space rental platform.
Extract structured search parameters from this user message: "${message}"

Return ONLY a JSON object with these fields (use null if not mentioned):
{
  "propertyType": null | "Warehouse" | "Kitchen" | "Event Hall" | "Office Space" | "Parking Space" | "Other",
  "city": null | string,
  "maxPrice": null | number,
  "amenities": null | string[],
  "date": null | string
}

Return ONLY the JSON, no explanation.`;

    let extractedParams = {};
    try {
      const extractionResult = await chatWithGroq([
        { role: 'system', content: 'You are a JSON extractor. Return only valid JSON.' },
        { role: 'user', content: extractionPrompt },
      ], { temperature: 0.1, max_tokens: 200 });

      const jsonMatch = extractionResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedParams = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn('Param extraction failed:', parseErr.message);
    }

    // Step 2: Build DB query from extracted params
    const dbFilter = { isPublished: true, isDeleted: { $ne: true } };
    if (extractedParams.propertyType) dbFilter.propertyType = extractedParams.propertyType;
    if (extractedParams.city) dbFilter['location.city'] = { $regex: extractedParams.city, $options: 'i' };
    if (extractedParams.maxPrice) dbFilter['price.amount'] = { $lte: Number(extractedParams.maxPrice) };
    if (extractedParams.amenities?.length) dbFilter.amenities = { $in: extractedParams.amenities };

    const listings = await Listing.find(dbFilter)
      .select('-verification')
      .sort({ avgRating: -1, totalBookings: -1 })
      .limit(3)
      .lean();

    // Step 3: Build Groq conversation
    const systemPrompt = `You are a helpful assistant for ReSpace, India's commercial space rental platform.
    Help users find spaces. Be conversational, concise, and helpful.
    ${listings.length > 0
      ? `I found ${listings.length} matching spaces: ${listings.map((l) => `${l.propertyName} in ${l.location.city} at ₹${l.price.amount}/${l.price.type}`).join(', ')}.`
      : 'No exact matches found in our database.'}
    If no listings found, suggest alternative searches but clearly state you could not find exact matches on ReSpace.
    NEVER make up listing data.`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: message },
    ];

    const reply = await chatWithGroq(groqMessages, { temperature: 0.7, max_tokens: 500 });

    const source = listings.length > 0 ? 'db' : 'groq_suggestion';

    res.json({
      success: true,
      data: {
        reply,
        listings: listings.length > 0 ? listings : [],
        source,
      },
    });
  } catch (error) {
    if (error.message?.includes('GROQ')) {
      return res.json({ success: true, data: { reply: 'I\'m having trouble connecting right now. Please try searching directly using our filters above.', listings: [], source: 'fallback' } });
    }
    next(error);
  }
});

// POST /api/ai/match
router.post('/match', verifyToken, async (req, res, next) => {
  try {
    const { query, filters = {} } = req.body;
    if (!query?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'query is required' } });
    }

    // Extract structured params
    const extractionPrompt = `Extract search filters from: "${query}"
Return ONLY JSON:
{
  "propertyType": null | "Warehouse" | "Kitchen" | "Event Hall" | "Office Space" | "Parking Space" | "Other",
  "city": null | string,
  "maxPrice": null | number,
  "minCapacity": null | number,
  "amenities": null | string[]
}`;

    let params = {};
    try {
      const result = await chatWithGroq([
        { role: 'system', content: 'JSON extractor only.' },
        { role: 'user', content: extractionPrompt },
      ], { temperature: 0.1, max_tokens: 200 });
      const match = result.match(/\{[\s\S]*\}/);
      if (match) params = JSON.parse(match[0]);
    } catch (e) {
      console.warn('Match extraction failed:', e.message);
    }

    // Merge with manual filters
    const dbFilter = { isPublished: true, isDeleted: { $ne: true }, ...filters };
    if (params.propertyType) dbFilter.propertyType = params.propertyType;
    if (params.city) dbFilter['location.city'] = { $regex: params.city, $options: 'i' };
    if (params.maxPrice) dbFilter['price.amount'] = { $lte: Number(params.maxPrice) };
    if (params.amenities?.length) dbFilter.amenities = { $in: params.amenities };

    const listings = await Listing.find(dbFilter)
      .select('-verification')
      .sort({ avgRating: -1, totalBookings: -1 })
      .limit(6)
      .lean();

    const top3 = listings.slice(0, 3);

    let reasoning = 'Matched based on your search criteria.';
    if (top3.length > 0) {
      try {
        reasoning = await chatWithGroq([
          { role: 'system', content: 'You are a ReSpace AI. Explain in 1-2 sentences why these spaces match the query.' },
          { role: 'user', content: `Query: "${query}". Top matches: ${top3.map((l) => l.propertyName).join(', ')}. Why do they match?` },
        ], { temperature: 0.7, max_tokens: 150 });
      } catch (e) {
        console.warn('Reasoning generation failed:', e.message);
      }
    }

    res.json({
      success: true,
      data: {
        matchedIds: top3.map((l) => l._id.toString()),
        listings: top3,
        reasoning,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/business-starter
router.post('/business-starter', verifyToken, async (req, res, next) => {
  try {
    const { businessType, location, budget } = req.body;
    if (!businessType || !location || !budget) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'businessType, location, and budget are required' } });
    }

    // Map business type to property type
    const typeMap = {
      'Food Business': 'Kitchen',
      'Event Planning': 'Event Hall',
      'E-commerce Storage': 'Warehouse',
      'Freelance/Creative Studio': 'Office Space',
    };
    const preferredType = typeMap[businessType];

    // Find matching listings
    const dbFilter = { isPublished: true, isDeleted: { $ne: true } };
    if (preferredType) dbFilter.propertyType = preferredType;
    dbFilter['location.city'] = { $regex: location, $options: 'i' };
    dbFilter['price.amount'] = { $lte: budget };

    const listings = await Listing.find(dbFilter)
      .select('-verification')
      .sort({ avgRating: -1 })
      .limit(3)
      .lean();

    // Generate AI recommendation
    const prompt = `You are a business advisor for ReSpace India. A user is starting a ${businessType} in ${location} with a monthly infrastructure budget of ₹${budget.toLocaleString('en-IN')}.

Write a helpful 2-3 sentence recommendation about what type of space they need.
Then provide exactly 3 actionable tips for them.

Format your response as JSON:
{
  "recommendation": "...",
  "tips": ["tip1", "tip2", "tip3"]
}

Return ONLY the JSON.`;

    let aiResponse = { recommendation: '', tips: [] };
    try {
      const result = await chatWithGroq([
        { role: 'system', content: 'You are a business advisor. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.7, max_tokens: 500 });
      const match = result.match(/\{[\s\S]*\}/);
      if (match) aiResponse = JSON.parse(match[0]);
    } catch (e) {
      aiResponse.recommendation = `For a ${businessType} in ${location} with ₹${budget.toLocaleString('en-IN')} budget, we recommend starting with a shared ${preferredType || 'commercial'} space to minimize upfront costs.`;
      aiResponse.tips = [
        'Start with a short-term rental to test your requirements before committing long-term.',
        'Look for spaces with included amenities like WiFi and Power Backup to reduce additional costs.',
        'Consider off-peak booking times to get better rates.',
      ];
    }

    res.json({
      success: true,
      data: {
        recommendation: aiResponse.recommendation,
        listings,
        tips: aiResponse.tips || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
