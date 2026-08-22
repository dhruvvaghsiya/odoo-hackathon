const { Router } = require('express');
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', listNotifications);
router.patch('/read-all', markAllAsRead);       // Must come before /:id
router.patch('/:id/read', markAsRead);

module.exports = router;
