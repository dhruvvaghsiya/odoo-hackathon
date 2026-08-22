const { Router } = require('express');
const healthRoutes = require('./health');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const cityRoutes = require('./city.routes');
const tripRoutes = require('./trip.routes');
const activityRoutes = require('./activity.routes');
const searchRoutes = require('./search.routes');
const publicRoutes = require('./public.routes');
const { listCityActivities } = require('../controllers/activity.controller');

const router = Router();

// ── Registered route groups ────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/trips', tripRoutes);
router.use('/activities', activityRoutes);
router.use('/search', searchRoutes);
router.use('/public', publicRoutes);

// ── Nested city → activities route ─────────────────
router.get('/cities/:cityId/activities', listCityActivities);

module.exports = router;
