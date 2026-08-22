const { fail } = require('../utils/apiResponse');

/**
 * Role-based authorisation middleware factory.
 *
 * Must be placed AFTER the `authenticate` middleware so that `req.user` exists.
 *
 * @param  {...string} allowedRoles  One or more roles permitted to access the route.
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.get('/admin/stats', authenticate, requireRole('admin'), handler);
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return fail(res, {
      statusCode: 401,
      message: 'Authentication required.',
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return fail(res, {
      statusCode: 403,
      message: 'You do not have permission to perform this action.',
    });
  }

  next();
};

/**
 * Shorthand: only admin users.
 */
const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireAdmin };
