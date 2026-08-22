/**
 * Standard API response helpers.
 *
 * Every response follows the shape:
 * {
 *   success: boolean,
 *   message: string,
 *   data:    any | null,
 *   error:   any | null
 * }
 */

const success = (res, { statusCode = 200, message = 'OK', data = null } = {}) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });

const created = (res, { message = 'Created', data = null } = {}) =>
  success(res, { statusCode: 201, message, data });

const fail = (res, { statusCode = 400, message = 'Bad request', error = null } = {}) =>
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error,
  });

module.exports = { success, created, fail };
