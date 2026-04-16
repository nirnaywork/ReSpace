/**
 * ReSpace Seed Script — Indian Commercial Listings via Groq AI
 * Uses 3 small Groq batches to avoid token limits, with JSON repair.
 * Run: node scripts/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const Listing = require('../models/Listing');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Real Unsplash photos by property type ─────────────────────────────────────
const PHOTOS = {
  'Warehouse': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80',
  ],
  'Kitchen': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  ],
  'Event Hall': [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800&q=80',
  ],
  'Office Space': [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
  ],
  'Parking Space': [
    'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&q=80',
  ],
  'Other': [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  ],
};

// ── Seed owners ───────────────────────────────────────────────────────────────
const SEED_OWNERS = [
  { uid: 'seed_owner_001', email: 'rajesh.kumar@respace.in', name: 'Rajesh Kumar', isVerified: true, roles: ['owner', 'renter'] },
  { uid: 'seed_owner_002', email: 'priya.sharma@respace.in', name: 'Priya Sharma', isVerified: true, roles: ['owner'] },
  { uid: 'seed_owner_003', email: 'arjun.mehta@respace.in', name: 'Arjun Mehta', isVerified: true, roles: ['owner', 'renter'] },
  { uid: 'seed_owner_004', email: 'kavitha.reddy@respace.in', name: 'Kavitha Reddy', isVerified: true, roles: ['owner'] },
  { uid: 'seed_owner_005', email: 'suresh.patel@respace.in', name: 'Suresh Patel', isVerified: true, roles: ['owner'] },
];

// ── 3 batches — each ~8–9 listings (keeps response under 4000 tokens) ─────────
const BATCHES = [
  {
    count: 8,
    cities: 'Mumbai (3), Delhi (3), Bangalore (2)',
    types: '2 Warehouse, 2 Kitchen, 2 Event Hall, 2 Office Space',
    priceHint: 'Mumbai Warehouse: 5000-15000/day, Delhi Office: 300-600/hour, Bangalore Kitchen: 400-800/hour, Event Hall: 15000-50000/day',
  },
  {
    count: 8,
    cities: 'Hyderabad (3), Chennai (3), Pune (2)',
    types: '2 Warehouse, 2 Kitchen, 2 Event Hall, 1 Office Space, 1 Parking Space',
    priceHint: 'Hyderabad Warehouse: 3000-8000/day, Chennai Kitchen: 300-600/hour, Pune Parking: 40-80/hour',
  },
  {
    count: 8,
    cities: 'Kolkata (2), Ahmedabad (2), Jaipur (2), Surat (2)',
    types: '2 Warehouse, 1 Kitchen, 2 Event Hall, 1 Office Space, 1 Parking Space, 1 Other',
    priceHint: 'Kolkata Warehouse: 2000-6000/day, Ahmedabad Event Hall: 8000-25000/day, Jaipur Office: 200-400/hour',
  },
];

// ── JSON repair: salvage complete objects from truncated response ──────────────
function repairJSON(raw) {
  let s = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  if (!s) return '[]';

  // Already valid
  try { JSON.parse(s); return s; } catch (_) {}

  // Try to close truncated array
  const lastBrace = s.lastIndexOf('}');
  if (lastBrace > 0) {
    s = s.slice(0, lastBrace + 1);
    // Make sure it starts with [
    if (!s.startsWith('[')) s = '[' + s;
    // Close array
    s = s + ']';
    try { JSON.parse(s); return s; } catch (_) {}

    // Last resort: find last comma-separated complete object
    const lastComma = s.lastIndexOf('},');
    if (lastComma > 0) {
      s = s.slice(0, lastComma + 1) + ']';
      if (!s.startsWith('[')) s = '[' + s;
      try { JSON.parse(s); return s; } catch (_) {}
    }
  }

  return '[]';
}

// ── Call Groq for one batch ───────────────────────────────────────────────────
async function callGroq(batch, batchNum) {
  const prompt = `Generate exactly ${batch.count} Indian commercial space listings as a JSON array for ReSpace rental platform.

Cities: ${batch.cities}
Types: ${batch.types}
Price hints: ${batch.priceHint}

Rules:
- Real Indian addresses with correct pincodes
- Amenities ONLY from: WiFi, Power Backup, Parking, AC, CCTV, Security Guard, Generator, Cafeteria, Lift, Restroom
- Days ONLY from: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- Keep description to 60-80 words
- avgRating between 3.8 and 4.9

Output ONLY a JSON array, no markdown:
[{"propertyName":"...","propertyType":"Warehouse","description":"...","location":{"address":"...","city":"Mumbai","state":"Maharashtra","pincode":"400001","lat":19.076,"lng":72.877},"price":{"amount":5000,"type":"day","currency":"INR"},"securityDeposit":5000,"refundPolicy":true,"refundHours":24,"availability":{"days":["Mon","Tue","Wed","Thu","Fri"],"openTime":"09:00","closeTime":"18:00"},"amenities":["WiFi","Power Backup","Parking"],"avgRating":4.3,"reviewCount":42,"totalBookings":95,"isVerified":true,"isFeatured":false}]`;

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You output only valid JSON arrays. No markdown. No explanation. Short descriptions.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 5000,
  });

  const raw = res.choices[0]?.message?.content?.trim() || '[]';
  const finishReason = res.choices[0]?.finish_reason;

  if (finishReason === 'length') {
    console.log(`   ⚠️  Batch ${batchNum} truncated — repairing JSON...`);
  }

  const cleaned = repairJSON(raw);

  try {
    const parsed = JSON.parse(cleaned);
    console.log(`   ✅ Batch ${batchNum}: ${parsed.length} listings parsed`);
    return parsed;
  } catch (e) {
    console.error(`   ❌ Batch ${batchNum} parse failed: ${e.message}`);
    console.error('   Snippet:', cleaned.slice(0, 200));
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const VALID_TYPES = ['Warehouse', 'Kitchen', 'Event Hall', 'Office Space', 'Parking Space', 'Other'];
const VALID_AMENITIES = ['WiFi', 'Power Backup', 'Parking', 'AC', 'CCTV', 'Security Guard', 'Generator', 'Cafeteria', 'Lift', 'Restroom'];
const VALID_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const VALID_PRICE_TYPES = ['hour', 'day', 'week'];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🌱 ReSpace Seed Script\n');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected\n');

  // Upsert seed owners
  console.log('👤 Upserting owners...');
  const ownerDocs = [];
  for (const o of SEED_OWNERS) {
    const doc = await User.findOneAndUpdate({ uid: o.uid }, { $set: o }, { upsert: true, new: true });
    ownerDocs.push(doc);
    console.log(`   ✔ ${o.name}`);
  }

  // Clear existing seed listings only
  const del = await Listing.deleteMany({ ownerId: { $in: ownerDocs.map((o) => o._id) } });
  console.log(`\n🗑  Cleared ${del.deletedCount} old seed listings\n`);

  // Fetch all batches from Groq
  console.log('🤖 Generating listings with Groq AI (3 batches)...');
  const all = [];
  for (let i = 0; i < BATCHES.length; i++) {
    const listings = await callGroq(BATCHES[i], i + 1);
    all.push(...listings);
    if (i < BATCHES.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(`\n📦 Total from Groq: ${all.length} listings\n`);

  // Insert into MongoDB
  let inserted = 0;
  for (let i = 0; i < all.length; i++) {
    const ai = all[i];
    const owner = ownerDocs[i % ownerDocs.length];
    const propertyType = VALID_TYPES.includes(ai.propertyType) ? ai.propertyType : 'Other';
    const photos = PHOTOS[propertyType] || PHOTOS['Other'];

    try {
      await new Listing({
        ownerId: owner._id,
        propertyName: String(ai.propertyName || 'Commercial Space').slice(0, 100),
        propertyType,
        description: String(ai.description || 'A premium commercial space available for rent in India.').slice(0, 2000),
        location: {
          address: String(ai.location?.address || 'India').slice(0, 200),
          city: String(ai.location?.city || 'Mumbai'),
          state: String(ai.location?.state || 'Maharashtra'),
          pincode: String(ai.location?.pincode || '400001'),
          lat: Number(ai.location?.lat) || null,
          lng: Number(ai.location?.lng) || null,
        },
        price: {
          amount: Math.max(1, Number(ai.price?.amount) || 500),
          type: VALID_PRICE_TYPES.includes(ai.price?.type) ? ai.price.type : 'day',
          currency: 'INR',
        },
        securityDeposit: Math.max(0, Number(ai.securityDeposit) || 0),
        refundPolicy: Boolean(ai.refundPolicy),
        refundHours: Number(ai.refundHours) || 24,
        availability: {
          days: (ai.availability?.days || []).filter((d) => VALID_DAYS.includes(d)).length > 0
            ? (ai.availability.days).filter((d) => VALID_DAYS.includes(d))
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          openTime: ai.availability?.openTime || '09:00',
          closeTime: ai.availability?.closeTime || '18:00',
        },
        amenities: (ai.amenities || []).filter((a) => VALID_AMENITIES.includes(a)),
        images: photos.slice(0, randInt(2, Math.min(3, photos.length))),
        isVerified: Boolean(ai.isVerified),
        isFeatured: Boolean(ai.isFeatured),
        isPublished: true,
        isDeleted: false,
        avgRating: Math.min(5.0, Math.max(3.5, Number(ai.avgRating) || 4.2)),
        reviewCount: Math.max(0, Number(ai.reviewCount) || randInt(5, 80)),
        totalBookings: Math.max(0, Number(ai.totalBookings) || randInt(10, 200)),
        viewCount: randInt(50, 1500),
      }).save();

      inserted++;
      console.log(`   [${i + 1}/${all.length}] ✔ ${propertyType} – "${ai.propertyName}" (${ai.location?.city || '?'})`);
    } catch (err) {
      console.error(`   [${i + 1}] ✗ ${err.message}`);
    }
  }

  console.log(`\n✅ Inserted ${inserted} listings\n`);

  // Summary
  const byType = await Listing.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('📊 By type:');
  byType.forEach(({ _id, count }) => console.log(`   ${_id}: ${count}`));

  const byCity = await Listing.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$location.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('\n🏙  By city:');
  byCity.forEach(({ _id, count }) => console.log(`   ${_id}: ${count}`));

  await mongoose.disconnect();
  console.log('\n✅ Done!\n');
}

main().catch((err) => {
  console.error('💥 Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
