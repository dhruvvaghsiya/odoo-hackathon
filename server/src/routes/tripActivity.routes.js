const { Router } = require('express');
const {
  createTripActivity,
  listTripActivities,
  updateTripActivity,
  deleteTripActivity,
} = require('../controllers/tripActivity.controller');

// mergeParams: true allows access to :tripId and :stopId from parent routers
const router = Router({ mergeParams: true });

router.post('/', createTripActivity);
router.get('/', listTripActivities);
router.patch('/:id', updateTripActivity);
router.delete('/:id', deleteTripActivity);

module.exports = router;
