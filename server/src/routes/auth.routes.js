const { Router } = require('express');
const { signup, login, logout, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

// ── Public routes (rate-limited) ───────────────────
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

// ── Protected routes ───────────────────────────────
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
