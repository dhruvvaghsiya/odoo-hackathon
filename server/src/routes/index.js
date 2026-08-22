const { Router } = require('express');
const healthRoutes = require('./health');
const authRoutes = require('./auth.routes');

const router = Router();

// ── Registered route groups ────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Future routes:
// router.use('/users',  userRoutes);

module.exports = router;
