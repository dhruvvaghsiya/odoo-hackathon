const { Router } = require('express');
const {
  listCities,
  searchCities,
  getPopularCities,
  getCityById,
} = require('../controllers/city.controller');

const router = Router();

// ── Public routes — no authentication required ─────────

// Static / keyword routes MUST come before the :id param route
router.get('/search',  searchCities);
router.get('/popular', getPopularCities);

// List with filters & pagination
router.get('/', listCities);

// Single city by UUID
router.get('/:id', getCityById);

module.exports = router;
