const tripActivityService = require('../services/tripActivity.service');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (value) => UUID_RE.test(value);

const isValidTime = (value) => /^\d{2}:\d{2}(:\d{2})?$/.test(value);

// ── POST /api/trips/:tripId/stops/:stopId/activities ───

const createTripActivity = async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID or stop ID format.',
      });
    }

    const {
      activity_id, activity_date, start_time, end_time,
      activity_order, notes, estimated_cost,
    } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (!activity_id || !isValidUUID(activity_id)) {
      errors.push('activity_id is required and must be a valid UUID.');
    }

    if (activity_order !== undefined && activity_order !== null) {
      if (!Number.isInteger(activity_order) || activity_order < 1) {
        errors.push('activity_order must be a positive integer.');
      }
    }

    if (start_time !== undefined && start_time !== null && !isValidTime(start_time)) {
      errors.push('start_time must be in HH:MM or HH:MM:SS format.');
    }

    if (end_time !== undefined && end_time !== null && !isValidTime(end_time)) {
      errors.push('end_time must be in HH:MM or HH:MM:SS format.');
    }

    if (start_time && end_time && start_time >= end_time) {
      errors.push('end_time must be after start_time.');
    }

    if (estimated_cost !== undefined && estimated_cost !== null) {
      if (typeof estimated_cost !== 'number' || estimated_cost < 0) {
        errors.push('estimated_cost must be a non-negative number.');
      }
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    const tripActivity = await tripActivityService.create(tripId, stopId, req.user.id, {
      activity_id, activity_date, start_time, end_time,
      activity_order, notes, estimated_cost,
    });

    return created(res, {
      message: 'Activity added to stop successfully.',
      data: { trip_activity: tripActivity },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/stops/:stopId/activities ────

const listTripActivities = async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID or stop ID format.',
      });
    }

    const activities = await tripActivityService.findAllByStop(
      tripId, stopId, req.user.id,
    );

    return success(res, {
      message: 'Trip activities retrieved successfully.',
      data: { trip_activities: activities },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/trips/:tripId/stops/:stopId/activities/:id

const updateTripActivity = async (req, res, next) => {
  try {
    const { tripId, stopId, id } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId) || !isValidUUID(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID, stop ID, or activity ID format.',
      });
    }

    const {
      activity_id, activity_date, start_time, end_time,
      activity_order, notes, estimated_cost,
    } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (activity_id !== undefined && !isValidUUID(activity_id)) {
      errors.push('activity_id must be a valid UUID.');
    }

    if (activity_order !== undefined && activity_order !== null) {
      if (!Number.isInteger(activity_order) || activity_order < 1) {
        errors.push('activity_order must be a positive integer.');
      }
    }

    if (start_time !== undefined && start_time !== null && !isValidTime(start_time)) {
      errors.push('start_time must be in HH:MM or HH:MM:SS format.');
    }

    if (end_time !== undefined && end_time !== null && !isValidTime(end_time)) {
      errors.push('end_time must be in HH:MM or HH:MM:SS format.');
    }

    if (estimated_cost !== undefined && estimated_cost !== null) {
      if (typeof estimated_cost !== 'number' || estimated_cost < 0) {
        errors.push('estimated_cost must be a non-negative number.');
      }
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    const tripActivity = await tripActivityService.update(
      id, tripId, stopId, req.user.id,
      { activity_id, activity_date, start_time, end_time, activity_order, notes, estimated_cost },
    );

    if (!tripActivity) {
      return fail(res, {
        statusCode: 404,
        message: 'Activity not found in this stop.',
      });
    }

    return success(res, {
      message: 'Trip activity updated successfully.',
      data: { trip_activity: tripActivity },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/trips/:tripId/stops/:stopId/activities/:id

const deleteTripActivity = async (req, res, next) => {
  try {
    const { tripId, stopId, id } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId) || !isValidUUID(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID, stop ID, or activity ID format.',
      });
    }

    const deleted = await tripActivityService.remove(id, tripId, stopId, req.user.id);

    if (!deleted) {
      return fail(res, {
        statusCode: 404,
        message: 'Activity not found in this stop.',
      });
    }

    return success(res, {
      message: 'Trip activity deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTripActivity,
  listTripActivities,
  updateTripActivity,
  deleteTripActivity,
};
