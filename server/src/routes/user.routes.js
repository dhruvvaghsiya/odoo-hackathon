const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { getMe, updateMe, deleteMe } = require('../controllers/user.controller');

const router = Router();

// ── GET /api/users/me ───────────────────────────────
router.get('/me', authenticate, getMe);

// ── PATCH /api/users/me ─────────────────────────────
router.patch(
  '/me',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name must be at most 100 characters'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must be at most 255 characters'),

    body('profile_photo')
      .optional({ values: 'null' })
      .trim()
      .isURL()
      .withMessage('Profile photo must be a valid URL'),

    body('language')
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage('Language must be 2-10 characters'),
  ],
  validate,
  updateMe,
);

// ── DELETE /api/users/me ────────────────────────────
router.delete('/me', authenticate, deleteMe);

module.exports = router;
