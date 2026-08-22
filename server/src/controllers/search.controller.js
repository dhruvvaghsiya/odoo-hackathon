const searchService = require('../services/search.service');
const { success, fail } = require('../utils/apiResponse');

// ── GET /api/search?q= ────────────────────────────────

/**
 * Unified discovery search across cities and activities.
 *
 * Query params:
 *  q         — required search term
 *  country   — filter by country
 *  region    — filter cities by region
 *  type      — filter activities by type
 *  cost_min  — filter activities min cost
 *  cost_max  — filter activities max cost
 *  duration  — filter activities max duration (minutes)
 *  sort      — popularity | name | cost (default: popularity)
 *  order     — asc | desc (default: desc)
 *  page      — 1-based (default: 1)
 *  limit     — max 100 (default: 20)
 */
const globalSearch = async (req, res, next) => {
  try {
    const {
      q, country, region, type,
      cost_min, cost_max, duration,
      sort, order, page, limit,
    } = req.query;

    // ── Validate search term ────────────────────────
    if (!q || q.trim().length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Search query parameter "q" is required.',
      });
    }

    if (q.trim().length < 2) {
      return fail(res, {
        statusCode: 400,
        message: 'Search query must be at least 2 characters.',
      });
    }

    const result = await searchService.unifiedSearch({
      q: q.trim(),
      country: country?.trim(),
      region: region?.trim(),
      type: type?.trim(),
      cost_min: cost_min != null ? parseFloat(cost_min) : undefined,
      cost_max: cost_max != null ? parseFloat(cost_max) : undefined,
      duration: duration != null ? parseInt(duration, 10) : undefined,
      sort,
      order,
      page,
      limit,
    });

    return success(res, {
      message: 'Search results retrieved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { globalSearch };
