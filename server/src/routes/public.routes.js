const { Router } = require('express');
const { getPublicTrip, copyPublicTrip } = require('../controllers/share.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

// ── Public (no auth) ───────────────────────────────────
router.get('/trips/:token', getPublicTrip);

// ── Authenticated — copy a shared trip into own account ─
router.post('/trips/:token/copy', authenticate, copyPublicTrip);

module.exports = router;
