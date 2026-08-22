/**
 * Middleware barrel export.
 * Import middleware from a single location:
 *   const { authenticate, requireAdmin, signupRules } = require('./middleware');
 */

const authenticate = require('./auth.middleware');
const { requireRole, requireAdmin } = require('./role.middleware');
const { validate, signupRules, loginRules, uuidParam } = require('./validate');
const { rateLimiter, authLimiter, apiLimiter } = require('./rateLimiter');
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');

module.exports = {
  // Auth
  authenticate,

  // Roles
  requireRole,
  requireAdmin,

  // Validation
  validate,
  signupRules,
  loginRules,
  uuidParam,

  // Rate limiting
  rateLimiter,
  authLimiter,
  apiLimiter,

  // Error handling
  errorHandler,
  notFound,
};
