const { validationResult } = require('express-validator');
const { fail } = require('../utils/apiResponse');

/**
 * Runs express-validator checks and returns 422 on failure.
 *
 * Usage:
 *   router.patch('/me', [...validations], validate, controller);
 */
const validate = (req, res, next) => {
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

module.exports = validate;
