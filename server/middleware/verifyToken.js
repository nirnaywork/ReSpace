const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No authorization token provided' },
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      // Development fallback: decode JWT without verification
      console.warn('⚠️ Firebase not initialized — using dev token bypass');
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      req.user = {
        uid: payload.user_id || payload.sub || 'dev-user',
        email: payload.email || 'dev@respace.in',
        name: payload.name || 'Dev User',
      };
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
    });
  }
};

module.exports = verifyToken;
