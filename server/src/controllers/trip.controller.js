const tripService = require('../services/trip.service');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate date ordering: start_date must be <= end_date (when both present).
 * @returns {string|null} error message or null
 */
const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return 'start_date must be on or before end_date.';
  }
  return null;
};

// ── POST /api/trips ────────────────────────────────────

const createTrip = async (req, res, next) => {
  try {
    const { name, description, cover_photo, start_date, end_date, total_budget, currency, is_public } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Trip name is required.');
    } else if (name.trim().length > 200) {
      errors.push('Trip name must be 200 characters or fewer.');
    }

    if (total_budget !== undefined && total_budget !== null) {
      if (typeof total_budget !== 'number' || total_budget < 0) {
        errors.push('total_budget must be a non-negative number.');
      }
    }

    if (currency !== undefined && currency !== null) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        errors.push('currency must be a 3-letter ISO code (e.g. USD, EUR).');
      }
    }

    const dateError = validateDateRange(start_date, end_date);
    if (dateError) errors.push(dateError);

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    // ── Create ──────────────────────────────────────
    const trip = await tripService.create(req.user.id, {
      name, description, cover_photo, start_date, end_date,
      total_budget, currency, is_public,
    });

    return created(res, {
      message: 'Trip created successfully.',
      data: { trip },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips ─────────────────────────────────────

const listTrips = async (req, res, next) => {
  try {
    const { page, limit, sort, order } = req.query;

    const result = await tripService.findAllByUser(req.user.id, {
      page, limit, sort, order,
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

// ── GET /api/trips/:id ─────────────────────────────────

const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const trip = await tripService.findById(id);

    if (!trip) {
      return fail(res, {
        statusCode: 404,
        message: 'Trip not found.',
      });
    }

    // ── Ownership / visibility check ────────────────
    if (trip.user_id !== req.user.id && !trip.is_public) {
      return fail(res, {
        statusCode: 404,
        message: 'Trip not found.',
      });
    }

    return success(res, {
      message: 'Trip retrieved successfully.',
      data: { trip },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/trips/:id ───────────────────────────────

const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const { name, description, cover_photo, start_date, end_date, total_budget, currency, is_public } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Trip name cannot be empty.');
      } else if (name.trim().length > 200) {
        errors.push('Trip name must be 200 characters or fewer.');
      }
    }

    if (total_budget !== undefined && total_budget !== null) {
      if (typeof total_budget !== 'number' || total_budget < 0) {
        errors.push('total_budget must be a non-negative number.');
      }
    }

    if (currency !== undefined && currency !== null) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        errors.push('currency must be a 3-letter ISO code (e.g. USD, EUR).');
      }
    }

    // For date range validation on partial update, we need to consider existing values.
    // We'll fetch the existing trip first to merge dates.
    if (start_date !== undefined || end_date !== undefined) {
      const existing = await tripService.findById(id);
      if (!existing || existing.user_id !== req.user.id) {
        return fail(res, {
          statusCode: 404,
          message: 'Trip not found.',
        });
      }
      const effectiveStart = start_date !== undefined ? start_date : existing.start_date;
      const effectiveEnd = end_date !== undefined ? end_date : existing.end_date;
      const dateError = validateDateRange(effectiveStart, effectiveEnd);
      if (dateError) errors.push(dateError);
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

    // ── Update (ownership guard in service) ─────────
    const trip = await tripService.update(id, req.user.id, {
      name, description, cover_photo, start_date, end_date,
      total_budget, currency, is_public,
    });

    if (!trip) {
      return fail(res, {
        statusCode: 404,
        message: 'Trip not found.',
      });
    }

    return success(res, {
      message: 'Trip updated successfully.',
      data: { trip },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/trips/:id ──────────────────────────────

const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!UUID_RE.test(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const deleted = await tripService.remove(id, req.user.id);

    if (!deleted) {
      return fail(res, {
        statusCode: 404,
        message: 'Trip not found.',
      });
    }

    return success(res, {
      message: 'Trip deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTrip,
  listTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};
