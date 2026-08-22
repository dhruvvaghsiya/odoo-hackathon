const { Router } = require('express');
const {
  createTrip,
  listTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require('../controllers/trip.controller');
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

// ── Nested stop routes ─────────────────────────────────
router.use('/:tripId/stops', stopRoutes);

module.exports = router;

