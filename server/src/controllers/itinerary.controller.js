const itineraryService = require('../services/itinerary.service');
const { success, fail } = require('../utils/apiResponse');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── PATCH /api/trips/:tripId/stops/reorder ─────────────

/**
 * Reorder all stops in a trip.
 *
 * Body: { "ordered_stop_ids": ["uuid1", "uuid2", ...] }
 */
const reorderStops = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const { ordered_stop_ids } = req.body;

    // ── Validate input shape ────────────────────────
    if (!Array.isArray(ordered_stop_ids)) {
      return fail(res, {
        statusCode: 400,
        message: 'ordered_stop_ids must be an array of stop UUIDs.',
      });
    }

    if (ordered_stop_ids.length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'ordered_stop_ids cannot be empty.',
      });
    }

    // Validate every element is a UUID
    const invalidIds = ordered_stop_ids.filter((id) => typeof id !== 'string' || !UUID_RE.test(id));
    if (invalidIds.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'All entries in ordered_stop_ids must be valid UUIDs.',
        error: invalidIds,
      });
    }

    const stops = await itineraryService.reorderStops(
      tripId,
      req.user.id,
      ordered_stop_ids,
    );

    return success(res, {
      message: 'Stops reordered successfully.',
      data: { stops },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/itinerary ───────────────────

/**
 * Get the full itinerary for a trip, including
 * trip info, ordered stops with cities, and summary stats.
 */
const getItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!UUID_RE.test(tripId)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid trip ID format.',
      });
    }

    const itinerary = await itineraryService.getItinerary(
      tripId,
      req.user.id,
    );

    return success(res, {
      message: 'Itinerary retrieved successfully.',
      data: itinerary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { reorderStops, getItinerary };
