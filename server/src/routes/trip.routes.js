const { Router } = require('express');
const {
  createTrip,
  listTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require('../controllers/trip.controller');
const {
  reorderStops,
  getItinerary,
} = require('../controllers/itinerary.controller');
const {
  reorderActivities,
  getTimeline,
} = require('../controllers/scheduling.controller');
const authenticate = require('../middleware/auth.middleware');
const stopRoutes = require('./stop.routes');

const router = Router();

// ── All trip routes require authentication ─────────────
router.use(authenticate);

router.post('/', createTrip);
router.get('/', listTrips);
router.get('/:id', getTripById);
router.patch('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// ── Itinerary endpoints ────────────────────────────────
router.get('/:tripId/itinerary', getItinerary);
router.patch('/:tripId/stops/reorder', reorderStops);

// ── Scheduling endpoints ───────────────────────────────
router.get('/:tripId/timeline', getTimeline);
router.patch('/:tripId/activities/reorder', reorderActivities);

// ── Nested stop routes (must come after named paths) ───
router.use('/:tripId/stops', stopRoutes);

module.exports = router;



