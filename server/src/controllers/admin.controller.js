const adminService = require('../services/admin.service');
const { success, fail } = require('../utils/apiResponse');

// ── GET /api/admin/analytics ───────────────────────────

const getAnalytics = async (_req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics();

    return success(res, {
      message: 'Platform analytics retrieved successfully.',
      data: { analytics },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/users ───────────────────────────────

const listUsers = async (req, res, next) => {
  try {
    const { sort, order, role, page, limit } = req.query;

    const result = await adminService.listUsers({
      sort,
      order,
      role,
      page,
      limit,
    });

    return success(res, {
      message: 'Users retrieved successfully.',
      data: {
        users: result.users,
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

// ── GET /api/admin/trips ───────────────────────────────

const listTrips = async (req, res, next) => {
  try {
    const { sort, order, is_public, page, limit } = req.query;

    const result = await adminService.listTrips({
      sort,
      order,
      is_public,
      page,
      limit,
    });

    return success(res, {
      message: 'Trips retrieved successfully.',
      data: {
        trips: result.trips,
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

module.exports = {
  getAnalytics,
  listUsers,
  listTrips,
};
