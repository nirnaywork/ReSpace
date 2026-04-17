const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const isOwner = require('../middleware/isOwner');
const prisma = require('../config/prisma');

// GET /api/listings — All published listings with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      type, city, minPrice, maxPrice, sort,
      amenities, page = 1, limit = 12,
    } = req.query;

    const where = { isPublished: true, isDeleted: false };

    if (type) where.propertyType = type;
    if (minPrice || maxPrice) {
      where.priceAmount = {};
      if (minPrice) where.priceAmount.gte = Number(minPrice);
      if (maxPrice) where.priceAmount.lte = Number(maxPrice);
    }
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      where.amenities = { hasEvery: amenityList };
    }
    
    // JSON filtering for City in Prisma Postgres. (Simple equality check in JSON fields)
    if (city) {
      where.location = {
        path: ['city'],
        string_contains: city
      };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { priceAmount: 'asc' };
    else if (sort === 'price_desc') orderBy = { priceAmount: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'popular') orderBy = { totalBookings: 'desc' };
    else if (sort === 'rating') orderBy = { avgRating: 'desc' };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          owner: {
            select: { name: true, photoURL: true, isVerified: true }
          }
        }
      }),
      prisma.listing.count({ where }),
    ]);

    // Map Prisma objects to match frontend Mongoose expectations roughly (_id mappings)
    const formattedListings = listings.map(l => ({
      ...l,
      _id: l.id,
      price: { amount: l.priceAmount, type: l.priceType, currency: 'INR' },
      ownerId: l.owner
    }));

    res.json({
      success: true,
      data: {
        listings: formattedListings,
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
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const listings = await prisma.listing.findMany({
      where: { ownerId: user.id, isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });

    const formattedListings = listings.map(l => ({
      ...l, _id: l.id, price: { amount: l.priceAmount, type: l.priceType, currency: 'INR' }
    }));

    res.json({ success: true, data: { listings: formattedListings } });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/:id — Single listing
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, photoURL: true, phone: true, email: true, isVerified: true, createdAt: true } }
      }
    });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'This space is no longer listed on ReSpace.' } });
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } }
    });

    const reviews = await prisma.review.findMany({
      where: { listingId: listing.id },
      include: { renter: { select: { name: true, photoURL: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const allReviews = await prisma.review.findMany({ where: { listingId: listing.id }, select: { rating: true } });
    const starBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => { starBreakdown[r.rating] = (starBreakdown[r.rating] || 0) + 1; });

    let similar = [];
    if (listing.location && listing.location.city) {
        similar = await prisma.listing.findMany({
          where: {
            id: { not: listing.id },
            propertyType: listing.propertyType,
            isPublished: true,
            isDeleted: false
          },
          take: 3
        });
    }

    // Map properties for generic UI components
    const formattedListing = {
      ...listing,
      _id: listing.id,
      price: { amount: listing.priceAmount, type: listing.priceType, currency: 'INR' },
      ownerId: listing.owner
    };
    
    const formattedReviews = reviews.map(r => ({ ...r, _id: r.id, renterId: r.renter }));
    const formattedSimilar = similar.map(s => ({ ...s, _id: s.id, price: { amount: s.priceAmount, type: s.priceType, currency: 'INR' } }));

    res.json({
      success: true,
      data: { listing: formattedListing, reviews: formattedReviews, starBreakdown, similar: formattedSimilar },
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
    body('propertyName').trim().notEmpty().isLength({ max: 100 }),
    body('propertyType').isIn(['Warehouse', 'Kitchen', 'Event Hall', 'Office Space', 'Parking Space', 'Other']),
    body('description').trim().notEmpty().isLength({ min: 50, max: 2000 }),
    body('price.amount').isNumeric().custom((val) => val > 0),
    body('price.type').isIn(['hour', 'day', 'week']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', errors: errors.array() } });
      }

      const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
      if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

      if (!user.roles.includes('owner')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: { push: 'owner' } }
        });
      }

      const { propertyName, propertyType, description, price, location, availability, amenities, images } = req.body;

      const listing = await prisma.listing.create({
        data: {
          ownerId: user.id,
          propertyName,
          propertyType,
          description,
          priceAmount: Number(price.amount),
          priceType: price.type,
          location: location || {},
          availability: availability || {},
          amenities: amenities || [],
          images: images || [],
          isPublished: true,
          isVerified: true
        }
      });

      res.status(201).json({ success: true, data: { listing: { ...listing, _id: listing.id } } });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/listings/:id — Update listing
router.put('/:id', verifyToken, isOwner, async (req, res, next) => {
  try {
    const { propertyName, propertyType, description, price, location, availability, amenities, images } = req.body;
    
    const updateData = {};
    if (propertyName) updateData.propertyName = propertyName;
    if (propertyType) updateData.propertyType = propertyType;
    if (description) updateData.description = description;
    if (price && price.amount) updateData.priceAmount = Number(price.amount);
    if (price && price.type) updateData.priceType = price.type;
    if (location) updateData.location = location;
    if (availability) updateData.availability = availability;
    if (amenities) updateData.amenities = amenities;
    if (images) updateData.images = images;

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, data: { listing: { ...listing, _id: listing.id, price: { amount: listing.priceAmount, type: listing.priceType } } } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/listings/:id — Soft delete
router.delete('/:id', verifyToken, isOwner, async (req, res, next) => {
  try {
    await prisma.listing.update({
      where: { id: req.params.id },
      data: { isPublished: false, isDeleted: true }
    });
    res.json({ success: true, data: { message: 'Listing deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

// POST /api/listings/:id/publish — Toggle publish status
router.post('/:id/publish', verifyToken, isOwner, async (req, res, next) => {
  try {
    const newStatus = !req.listing.isPublished;
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { isPublished: newStatus }
    });
    res.json({ success: true, data: { isPublished: listing.isPublished } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
