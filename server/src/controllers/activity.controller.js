const activityService = require('../services/activity.service');
const { success, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── GET /api/activities ────────────────────────────────

const listActivities = async (req, res, next) => {
  try {
    const {
      type, cost_min, cost_max, duration_min, duration_max,
      sort, order, page, limit,
    } = req.query;

    const result = await activityService.findAll({
      type,
      costMin: cost_min != null ? parseFloat(cost_min) : undefined,
      costMax: cost_max != null ? parseFloat(cost_max) : undefined,
      durationMin: duration_min != null ? parseInt(duration_min, 10) : undefined,
      durationMax: duration_max != null ? parseInt(duration_max, 10) : undefined,
      sort,
      order,
      page,
      limit,
    });

    return success(res, {
      message: 'Activities retrieved successfully.',
      data: {
        activities: result.activities,
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

// ── GET /api/activities/search?q= ──────────────────────

const searchActivities = async (req, res, next) => {
  try {
    const { q, type, page, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Search query parameter "q" is required.',
      });
    }

    const result = await activityService.search({
      q: q.trim(),
      type,
      page,
      limit,
    });

    return success(res, {
      message: 'Search results retrieved successfully.',
      data: {
        activities: result.activities,
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

// ── GET /api/activities/:id ────────────────────────────

const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid activity ID format.',
      });
    }

    const activity = await activityService.findById(id);

    if (!activity) {
      return fail(res, {
        statusCode: 404,
        message: 'Activity not found.',
      });
    }

    return success(res, {
      message: 'Activity retrieved successfully.',
      data: { activity },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/cities/:cityId/activities ─────────────────

const listCityActivities = async (req, res, next) => {
  try {
    const { cityId } = req.params;

    if (!UUID_RE.test(cityId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid city ID format.',
      });
    }

    const { type, sort, order, page, limit } = req.query;

    const result = await activityService.findByCityId(cityId, {
      type, sort, order, page, limit,
    });

    return success(res, {
      message: 'City activities retrieved successfully.',
      data: {
        activities: result.activities,
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

// ── GET /api/activities/popular ────────────────────────

const getPopularActivities = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const activities = await activityService.findPopular(limit);

    return success(res, {
      message: 'Popular activities retrieved successfully.',
      data: { activities },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listActivities,
  searchActivities,
  getActivityById,
  listCityActivities,
  getPopularActivities,
};
