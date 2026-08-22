const { Router } = require('express');
const {
  createStop,
  listStops,
  updateStop,
  deleteStop,
} = require('../controllers/stop.controller');

// mergeParams: true allows access to :tripId from the parent router
const router = Router({ mergeParams: true });

router.post('/', createStop);
router.get('/', listStops);
router.patch('/:stopId', updateStop);
router.delete('/:stopId', deleteStop);

module.exports = router;
