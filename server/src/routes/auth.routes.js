const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { register, login, logout } = require('../controllers/auth.controller');

const router = Router();

// ── POST /api/auth/register ─────────────────────────
router.post(
  '/register',
  [
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
  ],
  validate,
  register,
);

// ── POST /api/auth/login ────────────────────────────
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address'),

    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login,
);

// ── POST /api/auth/logout ───────────────────────────
// Authentication required so only valid tokens can "log out".
router.post('/logout', authenticate, logout);

module.exports = router;
