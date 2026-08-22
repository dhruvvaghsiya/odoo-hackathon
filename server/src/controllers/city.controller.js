const cityService = require('../services/city.service');
const { success, fail } = require('../utils/apiResponse');

// ── GET /api/cities ────────────────────────────────────
// Query params: country, region, cost_min, cost_max, sort, order, page, limit

const listCities = async (req, res, next) => {
  try {
    const { country, region, cost_min, cost_max, sort, order, page, limit } =
      req.query;

    const result = await cityService.findAll({
      country,
      region,
      costMin: cost_min != null ? parseFloat(cost_min) : undefined,
      costMax: cost_max != null ? parseFloat(cost_max) : undefined,
      sort,
      order,
      page,
      limit,
    });

    return success(res, {
      message: 'Cities retrieved successfully.',
      data: {
        cities: result.cities,
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

// ── GET /api/cities/search?q= ──────────────────────────

const searchCities = async (req, res, next) => {
  try {
    const { q, country, region, page, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Search query parameter "q" is required.',
      });
    }

    const result = await cityService.search({
      q: q.trim(),
      country,
      region,
      page,
      limit,
    });

    return success(res, {
      message: 'Search results retrieved successfully.',
      data: {
        cities: result.cities,
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

// ── GET /api/cities/popular ────────────────────────────

const getPopularCities = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const cities = await cityService.findPopular(limit);

    return success(res, {
      message: 'Popular cities retrieved successfully.',
      data: { cities },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/cities/:id ────────────────────────────────

const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Basic UUID format validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return fail(res, {
        statusCode: 400,
        message: 'Invalid city ID format.',
      });
    }

    const city = await cityService.findById(id);

    if (!city) {
      return fail(res, {
        statusCode: 404,
        message: 'City not found.',
      });
    }

    return success(res, {
      message: 'City retrieved successfully.',
      data: { city },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCities,
  searchCities,
  getPopularCities,
  getCityById,
};
