const { Router } = require('express');
const healthRoutes = require('./health');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const cityRoutes = require('./city.routes');
const tripRoutes = require('./trip.routes');

const router = Router();

// ── Registered route groups ────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/trips', tripRoutes);

module.exports = router;

