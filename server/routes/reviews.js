const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');

// GET /api/reviews/listing/:id
router.get('/listing/:id', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 5;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ listingId: req.params.id })
        .populate('renterId', 'name photoURL')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ listingId: req.params.id }),
    ]);

    res.json({
      success: true,
      data: { reviews, total, page, totalPages: Math.ceil(total / limit) },
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

    const review = await Review.findById(req.params.id).populate('listingId');
    if (!review) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });

    const user = await User.findOne({ uid: req.user.uid });
    if (!review.listingId.ownerId.toString() === user._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    review.ownerReply = reply.trim();
    await review.save();

    res.json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
