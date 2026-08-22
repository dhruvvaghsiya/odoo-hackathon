const { Router } = require('express');
const { globalSearch } = require('../controllers/search.controller');

const router = Router();

// ── Public — no authentication required ────────────────
router.get('/', globalSearch);

module.exports = router;
