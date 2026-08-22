const stopService = require('../services/stop.service');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (value) => UUID_RE.test(value);

const isValidDate = (value) => !isNaN(Date.parse(value));

// ── POST /api/trips/:tripId/stops ──────────────────────

const createStop = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!isValidUUID(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const { city_id, start_date, end_date, stop_order, notes } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (!city_id || !isValidUUID(city_id)) {
      errors.push('city_id is required and must be a valid UUID.');
    }

    if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) {
      errors.push('start_date must be a valid date.');
    }

    if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) {
      errors.push('end_date must be a valid date.');
    }

    if (stop_order !== undefined && stop_order !== null) {
      if (!Number.isInteger(stop_order) || stop_order < 1) {
        errors.push('stop_order must be a positive integer.');
      }
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    const stop = await stopService.create(tripId, req.user.id, {
      city_id,
      start_date,
      end_date,
      stop_order,
      notes,
    });

    return created(res, {
      message: 'Stop added successfully.',
      data: { stop },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/stops ───────────────────────

const listStops = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!isValidUUID(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const stops = await stopService.findAllByTrip(tripId, req.user.id);

    return success(res, {
      message: 'Stops retrieved successfully.',
      data: { stops },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/trips/:tripId/stops/:stopId ─────────────

const updateStop = async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID or stop ID format.',
      });
    }

    const { city_id, start_date, end_date, stop_order, notes } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (city_id !== undefined && !isValidUUID(city_id)) {
      errors.push('city_id must be a valid UUID.');
    }

    if (start_date !== undefined && start_date !== null && !isValidDate(start_date)) {
      errors.push('start_date must be a valid date.');
    }

    if (end_date !== undefined && end_date !== null && !isValidDate(end_date)) {
      errors.push('end_date must be a valid date.');
    }

    if (stop_order !== undefined && stop_order !== null) {
      if (!Number.isInteger(stop_order) || stop_order < 1) {
        errors.push('stop_order must be a positive integer.');
      }
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    const stop = await stopService.update(stopId, tripId, req.user.id, {
      city_id,
      start_date,
      end_date,
      stop_order,
      notes,
    });

    return success(res, {
      message: 'Stop updated successfully.',
      data: { stop },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/trips/:tripId/stops/:stopId ─────────────

const deleteStop = async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    if (!isValidUUID(tripId) || !isValidUUID(stopId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID or stop ID format.',
      });
    }

    const deleted = await stopService.remove(stopId, tripId, req.user.id);

    if (!deleted) {
      return fail(res, {
        statusCode: 404,
        message: 'Stop not found.',
      });
    }

    return success(res, {
      message: 'Stop deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStop,
  listStops,
  updateStop,
  deleteStop,
};
