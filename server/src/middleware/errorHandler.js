const config = require('../config');

const isDev = () => config.nodeEnv === 'development';

/**
 * Map well-known error types to safe HTTP responses.
 * Returns { statusCode, message } or null if unrecognised.
 */
const classifyError = (err) => {
  // ── JWT errors ───────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Invalid token. Please log in again.' };
  }
  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Token has expired. Please log in again.' };
  }
  if (err.name === 'NotBeforeError') {
    return { statusCode: 401, message: 'Token is not yet active.' };
  }

  // ── PostgreSQL errors (pg error codes) ───────────
  if (err.code === '23505') {
    // unique_violation — extract column name if possible
    const detail = err.detail || '';
    const match = detail.match(/Key \((.+?)\)/);
    const field = match ? match[1] : 'value';
    return {
      statusCode: 409,
      message: `A record with this ${field} already exists.`,
    };
  }
  if (err.code === '23503') {
    // foreign_key_violation
    return {
      statusCode: 400,
      message: 'Referenced record does not exist.',
    };
  }
  if (err.code === '23502') {
    // not_null_violation
    return {
      statusCode: 400,
      message: isDev()
        ? `Missing required field: ${err.column}`
        : 'A required field is missing.',
    };
  }
  if (err.code === '23514') {
    // check_violation
    return {
      statusCode: 400,
      message: 'Data validation failed at the database level.',
    };
  }

  // ── Database Connection errors ──────────────────
  if (err.code === 'ECONNREFUSED') {
    return {
      statusCode: 503,
      message: 'Database server is currently unavailable. Please make sure PostgreSQL is running.',
    };
  }
  if (err.code === '28P01') {
    return {
      statusCode: 500,
      message: 'Database authentication failed. Please check PostgreSQL credentials.',
    };
  }
  if (err.code === '3D000') {
    return {
      statusCode: 500,
      message: 'Database does not exist. Please check your DB_NAME configuration.',
    };
  }

  // ── express-validator / SyntaxError (bad JSON) ───
  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Malformed JSON in request body.' };
  }

  // ── Operational errors with an explicit statusCode ─
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    return { statusCode: err.statusCode, message: err.message };
  }

  return null; // unknown → treat as 500
};

/**
 * Central error-handling middleware.
 * Must have the 4-argument signature so Express recognises it as an error handler.
 *
 * SECURITY: User-facing message is always clean and descriptive.
 * SQL errors and technical stack traces are never exposed in message.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Always log the full error server-side
  console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`);
  if (isDev()) {
    console.error(err.stack);
    if (err.code) console.error(`[ERROR] PG code: ${err.code}`);
  }

  const classified = classifyError(err);

  if (classified) {
    return res.status(classified.statusCode).json({
      success: false,
      message: classified.message,
      data: null,
      error: isDev() ? err.stack : null,
    });
  }

  // ── Unclassified (500) — safe generic response ───
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: 'We encountered an unexpected issue processing your request. Please try again.',
    data: null,
    error: isDev() ? err.stack : null,
  });
};

module.exports = errorHandler;

