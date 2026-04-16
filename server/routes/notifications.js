const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notifications/mine
router.get('/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: { notification: notif } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
