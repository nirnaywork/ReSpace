const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', verifyToken, async (req, res, next) => {
  try {
    const { uid, email, name } = req.user;
    const { photoURL, phone } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email,
        name: name || req.body.name || email.split('@')[0],
        photoURL: photoURL || '',
        phone: phone || '',
        roles: [],
      });
      await user.save();
    } else {
      // Update last info from Firebase
      if (photoURL && !user.photoURL) {
        user.photoURL = photoURL;
      }
      await user.save();
    }

    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid }).populate('savedListings', 'propertyName images location price');
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
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
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (photoURL !== undefined) user.photoURL = photoURL;
      await user.save();

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

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      await user.save();
    }

    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (error) {
    next(error);
  }
});

const sanitizeUser = (user) => ({
  _id: user._id,
  uid: user.uid,
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
