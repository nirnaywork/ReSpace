const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
    }
  },
});

// POST /api/upload/image
router.post('/image', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No image file provided' } });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('your_')) {
      // Return mock URL for development
      const mockUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
      return res.json({
        success: true,
        data: { url: mockUrl, publicId: `mock_${Date.now()}` },
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'respace', resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      data: { url: uploadResult.secure_url, publicId: uploadResult.public_id },
    });
  } catch (error) {
    if (error.message.includes('Only JPG')) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: error.message } });
    }
    next(error);
  }
});

// DELETE /api/upload/image
router.delete('/image', verifyToken, async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'publicId is required' } });
    }

    if (publicId.startsWith('mock_')) {
      return res.json({ success: true, data: { message: 'Mock image deleted' } });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, data: { message: 'Image deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
