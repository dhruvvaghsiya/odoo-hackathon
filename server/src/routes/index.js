const { Router } = require('express');
const healthRoutes = require('./health');

const router = Router();

// ── Registered route groups ────────────────────────
router.use('/health', healthRoutes);

// Future routes:
// router.use('/auth',   authRoutes);
// router.use('/users',  userRoutes);

module.exports = router;
