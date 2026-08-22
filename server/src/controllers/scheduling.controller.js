const schedulingService = require('../services/scheduling.service');
const { success, fail } = require('../utils/apiResponse');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── PATCH /api/trips/:tripId/activities/reorder ────────

/**
 * Reorder all activities within a trip.
 *
 * Body: { "ordered_activity_ids": ["uuid1", "uuid2", ...] }
 *
 * Validates:
 *  - activity date belongs to stop dates
 *  - valid start/end times
 *  - activity belongs to correct stop
 *  - no obvious same-day time overlaps
 *  - maintains activity ordering
 */
const reorderActivities = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const { ordered_activity_ids } = req.body;

    // ── Validate input shape ────────────────────────
    if (!Array.isArray(ordered_activity_ids)) {
      return fail(res, {
        statusCode: 400,
        message: 'ordered_activity_ids must be an array of trip_activity UUIDs.',
      });
    }

    if (ordered_activity_ids.length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'ordered_activity_ids cannot be empty.',
      });
    }

    // Validate every element is a UUID
    const invalidIds = ordered_activity_ids.filter(
      (id) => typeof id !== 'string' || !UUID_RE.test(id),
    );
    if (invalidIds.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'All entries in ordered_activity_ids must be valid UUIDs.',
        error: invalidIds,
      });
    }

    const activities = await schedulingService.reorderActivities(
      tripId,
      req.user.id,
      ordered_activity_ids,
    );

    return success(res, {
      message: 'Activities reordered successfully.',
      data: { activities },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/timeline ───────────────────

/**
 * Get a day-by-day timeline for a trip.
 *
 * Returns:
 *  - date, city, activities per day
 *  - start_time, end_time, cost per activity
 *  - summary with total days, cities, costs
 */
const getTimeline = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const timeline = await schedulingService.getTimeline(
      tripId,
      req.user.id,
    );

    return success(res, {
      message: 'Timeline retrieved successfully.',
      data: timeline,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { reorderActivities, getTimeline };
