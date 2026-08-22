const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/db');
const { fail } = require('../utils/apiResponse');

/**
 * Protect routes — requires a valid JWT in the Authorization header.
 *
 * On success, attaches `req.user` with the full user row (minus password_hash).
 */
const authenticate = async (req, res, next) => {
  try {
    // ── Extract token ────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return fail(res, {
        statusCode: 401,
        message: 'Authentication required. Please provide a Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return fail(res, {
        statusCode: 401,
        message: 'Authentication required. Token is missing.',
      });
    }

    // ── Verify token ─────────────────────────────────
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again.'
          : 'Invalid token. Please log in again.';
      return fail(res, { statusCode: 401, message });
    }

    // ── Fetch user from DB (ensure they still exist) ─
    const { rows } = await query(
      `SELECT id, name, email, profile_photo, language, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [decoded.id],
    );

    if (rows.length === 0) {
      return fail(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists.',
      });
    }

    // Attach user to request — password_hash is never selected
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
