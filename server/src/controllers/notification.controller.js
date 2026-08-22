const notificationService = require('../services/notification.service');
const { success, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── GET /api/notifications ─────────────────────────────

const listNotifications = async (req, res, next) => {
  try {
    const { is_read, page, limit } = req.query;

    const result = await notificationService.findAllByUser(req.user.id, {
      is_read,
      page,
      limit,
    });

    return success(res, {
      message: 'Notifications retrieved successfully.',
      data: {
        notifications: result.notifications,
        unread_count: result.unread_count,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/notifications/:id/read ──────────────────

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return fail(res, { statusCode: 400, message: 'Invalid notification ID format.' });
    }

    const notification = await notificationService.markAsRead(id, req.user.id);

    if (!notification) {
      return fail(res, { statusCode: 404, message: 'Notification not found.' });
    }

    return success(res, {
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/notifications/read-all ──────────────────

const markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);

    return success(res, {
      message: `${count} notification(s) marked as read.`,
      data: { updated_count: count },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
