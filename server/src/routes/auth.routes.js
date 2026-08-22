const { Router } = require('express');
const { signup, login, logout, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const { signupRules, loginRules } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

// ── Public routes (rate-limited + validated) ───────
router.post('/signup', authLimiter, signupRules, signup);
router.post('/login', authLimiter, loginRules, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;


