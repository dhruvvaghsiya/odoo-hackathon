const userService = require('../services/user.service');
const { success, created, fail } = require('../utils/apiResponse');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, language } = req.body;
    const result = await userService.register({ name, email, password, language });

    return created(res, {
      message: 'Registration successful',
      data: { user: result.user, token: result.token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login({ email, password });

    return success(res, {
      message: 'Login successful',
      data: { user: result.user, token: result.token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 *
 * JWT is stateless — the server cannot revoke a token without a blacklist.
 * This endpoint exists so the frontend has a canonical logout URL to call.
 * The frontend should delete the stored token on its side.
 *
 * If server-side token invalidation is needed later, implement a token
 * blacklist (e.g. Redis set of revoked JTIs checked in the auth middleware).
 */
const logout = async (_req, res, _next) => {
  return success(res, {
    message: 'Logged out successfully. Please discard the token client-side.',
  });
};

module.exports = { register, login, logout };
