const config = require('../config');

/**
 * Central error-handling middleware.
 * Must have the 4-argument signature so Express recognises it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${statusCode} — ${message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: config.nodeEnv === 'development' ? err.stack : null,
  });
};

module.exports = errorHandler;
