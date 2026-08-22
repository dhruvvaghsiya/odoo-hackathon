const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/apiResponse');

/**
 * JWT authentication middleware.
 *
 * Expects:  Authorization: Bearer <token>
 * Attaches: req.user = { id, email, role }
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, {
      statusCode: 401,
      message: 'Authentication required',
      error: 'Missing or malformed Authorization header',
    });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';

    return fail(res, {
      statusCode: 401,
      message,
      error: err.message,
    });
  }
};

module.exports = authenticate;
