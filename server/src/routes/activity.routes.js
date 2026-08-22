const { Router } = require('express');
const {
  listActivities,
  searchActivities,
  getPopularActivities,
  getActivityById,
} = require('../controllers/activity.controller');

const router = Router();

// ── Public routes — no authentication required ─────────

// Static / keyword routes MUST come before the :id param route
router.get('/search',  searchActivities);
router.get('/popular', getPopularActivities);

// List with filters & pagination
router.get('/', listActivities);

// Single activity by UUID
router.get('/:id', getActivityById);

module.exports = router;

