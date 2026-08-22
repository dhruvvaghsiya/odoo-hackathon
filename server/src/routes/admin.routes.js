const { Router } = require('express');
const authenticate = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const {
  getAnalytics,
  listUsers,
  listTrips,
} = require('../controllers/admin.controller');

const router = Router();

// ── All admin routes require authentication + admin role ──
router.use(authenticate);
router.use(requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/users', listUsers);
router.get('/trips', listTrips);

module.exports = router;
