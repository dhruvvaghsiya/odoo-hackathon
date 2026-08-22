const { body, param, validationResult } = require('express-validator');
const { fail } = require('../utils/apiResponse');

/**
 * Higher-order middleware that runs an array of express-validator chains
 * then returns 422 on failure.
 *
 * Usage:
 *   router.patch('/me', validate([body('name').optional().trim()...]), controller);
 *   router.post('/signup', signupRules, controller);
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation chains
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return fail(res, {
        statusCode: 422,
        message: 'Validation failed',
        error: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    next();
  };
};

// ── Pre-built validation chains ────────────────────────

const signupRules = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be at most 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be at most 255 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language must be 2-10 characters'),
]);

const loginRules = validate([
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('password').notEmpty().withMessage('Password is required'),
]);

/**
 * Reusable UUID param validator.
 * @param {string} paramName - the route param name (default: 'id')
 */
const uuidParam = (paramName = 'id') =>
  validate([
    param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`),
  ]);

module.exports = { validate, signupRules, loginRules, uuidParam };
