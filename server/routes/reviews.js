const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../config/prisma');

// GET /api/reviews/listing/:id
router.get('/listing/:id', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 5;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId: req.params.id },
        include: { renter: { select: { name: true, photoURL: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { listingId: req.params.id } }),
    ]);

    const formattedReviews = reviews.map(r => ({ ...r, _id: r.id, renterId: r.renter }));

    res.json({
      success: true,
      data: { reviews: formattedReviews, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/reviews/:id/reply
router.put('/:id/reply', verifyToken, async (req, res, next) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim()) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Reply cannot be empty' } });
    }

    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { listing: true }
    });
    if (!review) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });

    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (review.listing.ownerId !== user.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: { ownerReply: reply.trim() }
    });

    res.json({ success: true, data: { review: { ...updatedReview, _id: updatedReview.id } } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
