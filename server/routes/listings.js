const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const isOwner = require('../middleware/isOwner');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

// GET /api/listings — All published listings with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      type, city, minPrice, maxPrice, sort,
      amenities, available, search, page = 1, limit = 12,
    } = req.query;

    const filter = { isPublished: true, isDeleted: { $ne: true } };

    if (type) filter.propertyType = type;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }
    if (available) {
      filter['bookedSlots.date'] = { $ne: available };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'price.amount': 1 };
    else if (sort === 'price_desc') sortOption = { 'price.amount': -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'popular') sortOption = { totalBookings: -1 };
    else if (sort === 'rating') sortOption = { avgRating: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const SAFE_FIELDS = '-verification.aadhaar -verification.pan';
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .select(SAFE_FIELDS)
        .populate('ownerId', 'name photoURL isVerified')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        listings,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/owner/my-spaces — Owner's own listings
router.get('/owner/my-spaces', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const listings = await Listing.find({ ownerId: user._id, isDeleted: { $ne: true } })
      .select('-verification.aadhaar -verification.pan')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { listings } });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/:id — Single listing
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .select('-verification.aadhaar -verification.pan')
      .populate('ownerId', 'name photoURL phone email isVerified createdAt')
      .lean();

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'This space is no longer listed on ReSpace.' } });
    }

    // Increment view count
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Fetch recent reviews summary
    const reviews = await Review.find({ listingId: listing._id })
      .populate('renterId', 'name photoURL')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Star breakdown
    const allReviews = await Review.find({ listingId: listing._id }).select('rating').lean();
    const starBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => { starBreakdown[r.rating] = (starBreakdown[r.rating] || 0) + 1; });

    // Similar listings
    const similar = await Listing.find({
      _id: { $ne: listing._id },
      propertyType: listing.propertyType,
      'location.city': listing.location.city,
      isPublished: true,
      isDeleted: { $ne: true },
    })
      .select('-verification.aadhaar -verification.pan')
      .limit(3)
      .lean();

    res.json({
      success: true,
      data: { listing, reviews, starBreakdown, similar },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/listings — Create listing
router.post(
  '/',
  verifyToken,
  [
    body('propertyName').trim().notEmpty().withMessage('Property name is required').isLength({ max: 100 }),
    body('propertyType').isIn(['Warehouse', 'Kitchen', 'Event Hall', 'Office Space', 'Parking Space', 'Other']),
    body('description').trim().notEmpty().isLength({ min: 50, max: 2000 }),
    body('location.address').trim().notEmpty().withMessage('Address is required'),
    body('price.amount').isNumeric().custom((val) => val > 0).withMessage('Price must be positive'),
    body('price.type').isIn(['hour', 'day', 'week']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', errors: errors.array() },
        });
      }

      const user = await User.findOne({ uid: req.user.uid });
      if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

      // Add owner role if not present
      if (!user.roles.includes('owner')) {
        user.roles.push('owner');
        await user.save();
      }

      const listingData = { ...req.body, ownerId: user._id };
      
      // Handle verification fields
      if (listingData.verification) {
        listingData.verification.isSubmitted = true;
      }

      const listing = new Listing(listingData);
      await listing.save();

      res.status(201).json({ success: true, data: { listing: listing.toObject({ versionKey: false }) } });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/listings/:id — Update listing
router.put('/:id', verifyToken, isOwner, async (req, res, next) => {
  try {
    const { verification, isVerified, totalBookings, avgRating, viewCount, ...updateData } = req.body;
    updateData.updatedAt = Date.now();

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-verification.aadhaar -verification.pan');

    res.json({ success: true, data: { listing } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/listings/:id — Soft delete
router.delete('/:id', verifyToken, isOwner, async (req, res, next) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, {
      isPublished: false,
      isDeleted: true,
      updatedAt: Date.now(),
    });
    res.json({ success: true, data: { message: 'Listing deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

// POST /api/listings/:id/publish — Toggle isPublished
router.post('/:id/publish', verifyToken, isOwner, async (req, res, next) => {
  try {
    const listing = req.listing;
    listing.isPublished = !listing.isPublished;
    listing.updatedAt = Date.now();
    await listing.save();

    res.json({ success: true, data: { isPublished: listing.isPublished } });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/:id/availability — Get booked slots for a month
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { month } = req.query; // "YYYY-MM"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PARAM', message: 'month must be YYYY-MM' } });
    }

    const listing = await Listing.findById(req.params.id).select('bookedSlots availability').lean();
    if (!listing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } });
    }

    const monthSlots = listing.bookedSlots.filter((s) => s.date && s.date.startsWith(month));

    res.json({
      success: true,
      data: {
        bookedSlots: monthSlots,
        availability: listing.availability,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
