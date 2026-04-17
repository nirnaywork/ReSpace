const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const prisma = require('../config/prisma');

// POST /api/auth/register
router.post('/register', verifyToken, async (req, res, next) => {
  try {
    const { uid, email, name } = req.user;
    const { photoURL, phone } = req.body;

    let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name: name || req.body.name || email.split('@')[0],
          photoURL: photoURL || '',
          phone: phone || '',
          roles: [],
        }
      });
    } else {
      // Update last info from Firebase
      if (photoURL && !user.photoURL) {
        user = await prisma.user.update({
          where: { firebaseUid: uid },
          data: { photoURL }
        });
      }
    }

    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    
    // In MongoDB we populated savedListings, skipping for simplicity or can implement manual fetch if needed
    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/me
router.put(
  '/me',
  verifyToken,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().matches(/^[+\d\s-]{7,15}$/).withMessage('Invalid phone number'),
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

      const { name, phone, photoURL } = req.body;
      const userExists = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
      
      if (!userExists) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (photoURL !== undefined) updateData.photoURL = photoURL;

      const user = await prisma.user.update({
        where: { firebaseUid: req.user.uid },
        data: updateData
      });

      res.json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/add-role
router.post('/add-role', verifyToken, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['owner', 'renter'].includes(role)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Role must be owner or renter' } });
    }

    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    if (!user.roles.includes(role)) {
      const updatedRoles = [...user.roles, role];
      const updatedUser = await prisma.user.update({
        where: { firebaseUid: req.user.uid },
        data: { roles: updatedRoles }
      });
      res.json({ success: true, data: { user: sanitizeUser(updatedUser) } });
    } else {
      res.json({ success: true, data: { user: sanitizeUser(user) } });
    }
  } catch (error) {
    next(error);
  }
});

const sanitizeUser = (user) => ({
  _id: user.id || user._id, // map Prisma id to old _id format for frontend backwards compatibility
  uid: user.firebaseUid,
  email: user.email,
  name: user.name,
  photoURL: user.photoURL,
  phone: user.phone,
  roles: user.roles,
  savedListings: user.savedListings,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

module.exports = router;
