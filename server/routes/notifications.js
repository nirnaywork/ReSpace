const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../config/prisma');

// GET /api/notifications/mine
router.get('/mine', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const formatted = notifications.map(n => ({ ...n, _id: n.id }));

    res.json({ success: true, data: { notifications: formatted, unreadCount } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', verifyToken, async (req, res, next) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ success: true, data: { notification: { ...notif, _id: notif.id } } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
