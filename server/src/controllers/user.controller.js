const userService = require('../services/user.service');
const { success, fail } = require('../utils/apiResponse');

/**
 * GET /api/users/me
 * Return the authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);

    if (!user) {
      return fail(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    return success(res, {
      message: 'Profile retrieved',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/me
 * Update the authenticated user's profile.
 * Allowed fields: name, email, profile_photo, language
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, email, profile_photo, language } = req.body;
    const updated = await userService.updateProfile(req.user.id, {
      name,
      email,
      profile_photo,
      language,
    });

    return success(res, {
      message: 'Profile updated',
      data: { user: updated },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/me
 * Permanently delete the authenticated user's account.
 * All associated trips/stops cascade-delete via the DB schema.
 */
const deleteMe = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);

    return success(res, {
      message: 'Account deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, deleteMe };
