const { Router } = require('express');
const {
  createStop,
  listStops,
  updateStop,
  deleteStop,
} = require('../controllers/stop.controller');
const tripActivityRoutes = require('./tripActivity.routes');

// mergeParams: true allows access to :tripId from the parent router
const router = Router({ mergeParams: true });

router.post('/', createStop);
router.get('/', listStops);
router.patch('/:stopId', updateStop);
router.delete('/:stopId', deleteStop);

// ── Nested activity routes ─────────────────────────
router.use('/:stopId/activities', tripActivityRoutes);

module.exports = router;

