const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', errors },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: `${field} already exists` },
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: 'Invalid ID format' },
    });
  }

  // Firebase auth errors
  if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication token' },
    });
  }

  // Default error
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message },
  });
};

module.exports = errorHandler;
