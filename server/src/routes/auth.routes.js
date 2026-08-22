const { Router } = require('express');
const { signup, login, logout, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;
