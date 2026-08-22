const db = require('../config/db');

// ── Column definitions ─────────────────────────────────

const CITY_COLUMNS = `
  id, name, country, region, description, image,
  cost_index, popularity, latitude, longitude
`;

const ACTIVITY_COLUMNS = `
  a.id, a.city_id, a.name, a.description, a.image,
  a.type, a.cost, a.duration_minutes, a.popularity,
  a.created_at, a.updated_at
`;

const ACTIVITY_WITH_CITY = `
  ${ACTIVITY_COLUMNS},
  c.name    AS city_name,
  c.country AS city_country,
  c.region  AS city_region
`;

// ── Formatters ─────────────────────────────────────────

const formatActivity = (row) => ({
  id: row.id,
  city_id: row.city_id,
  name: row.name,
  description: row.description,
  image: row.image,
  type: row.type,
  cost: row.cost,
  duration_minutes: row.duration_minutes,
  popularity: row.popularity,
  created_at: row.created_at,
  updated_at: row.updated_at,
  city: {
    id: row.city_id,
    name: row.city_name,
    country: row.city_country,
    region: row.city_region,
  },
});

// ── Pagination helper ──────────────────────────────────

const parsePagination = (rawPage, rawLimit) => {
  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(rawPage, 10) || 1, 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
};

// ── UNIFIED SEARCH ─────────────────────────────────────

/**
 * Search across cities AND activities.
 *
 * Runs two parameterized queries in parallel (Promise.all).
 * Never exposes private trip data — only public catalog tables.
 *
 * @param {object} opts
 * @param {string} opts.q            — required search term
 * @param {string} [opts.country]    — filter cities/activities by country
 * @param {string} [opts.region]     — filter cities by region
 * @param {string} [opts.type]       — filter activities by type
 * @param {number} [opts.cost_min]   — filter activities min cost
 * @param {number} [opts.cost_max]   — filter activities max cost
 * @param {number} [opts.duration]   — filter activities max duration (minutes)
 * @param {string} [opts.sort]       — popularity | name | cost (default: popularity)
 * @param {string} [opts.order]      — asc | desc (default: desc)
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @returns {Promise<object>}
 */
const unifiedSearch = async (opts = {}) => {
  const { q } = opts;
  const searchTerm = `%${q}%`;
  const { limit, page, offset } = parsePagination(opts.page, opts.limit);

  // Run city and activity searches in parallel
  const [cityResult, activityResult] = await Promise.all([
    searchCities(searchTerm, opts, limit, page, offset),
    searchActivities(searchTerm, opts, limit, page, offset),
  ]);

  return {
    cities: cityResult,
    activities: activityResult,
  };
};

// ── City sub-search ────────────────────────────────────

const searchCities = async (searchTerm, opts, limit, page, offset) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Text search on name, country, region
  conditions.push(`(
    name ILIKE $${paramIndex} OR
    country ILIKE $${paramIndex} OR
    region ILIKE $${paramIndex}
  )`);
  params.push(searchTerm);
  paramIndex++;

  if (opts.country) {
    conditions.push(`LOWER(country) = LOWER($${paramIndex++})`);
    params.push(opts.country);
  }

  if (opts.region) {
    conditions.push(`LOWER(region) = LOWER($${paramIndex++})`);
    params.push(opts.region);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Sorting
  const allowedSort = ['popularity', 'name', 'cost_index'];
  const sortCol = allowedSort.includes(opts.sort) ? opts.sort : 'popularity';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM cities ${whereClause}`,
    params,
  );
  const total = parseInt(countRows[0].total, 10);

  // Data
  const { rows: cities } = await db.query(
    `SELECT ${CITY_COLUMNS}
     FROM cities
     ${whereClause}
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return {
    results: cities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Activity sub-search ────────────────────────────────

const searchActivities = async (searchTerm, opts, limit, page, offset) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Text search on activity name, description, type
  conditions.push(`(
    a.name ILIKE $${paramIndex} OR
    a.description ILIKE $${paramIndex} OR
    a.type ILIKE $${paramIndex}
  )`);
  params.push(searchTerm);
  paramIndex++;

  if (opts.country) {
    conditions.push(`LOWER(c.country) = LOWER($${paramIndex++})`);
    params.push(opts.country);
  }

  if (opts.type) {
    conditions.push(`a.type = $${paramIndex++}`);
    params.push(opts.type);
  }

  if (opts.cost_min != null) {
    conditions.push(`a.cost >= $${paramIndex++}`);
    params.push(opts.cost_min);
  }

  if (opts.cost_max != null) {
    conditions.push(`a.cost <= $${paramIndex++}`);
    params.push(opts.cost_max);
  }

  if (opts.duration != null) {
    conditions.push(`a.duration_minutes <= $${paramIndex++}`);
    params.push(opts.duration);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Sorting
  const allowedSort = ['popularity', 'name', 'cost'];
  const sortCol = allowedSort.includes(opts.sort) ? `a.${opts.sort}` : 'a.popularity';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total
     FROM activities a
     JOIN cities c ON c.id = a.city_id
     ${whereClause}`,
    params,
  );
  const total = parseInt(countRows[0].total, 10);

  // Data
  const { rows } = await db.query(
    `SELECT ${ACTIVITY_WITH_CITY}
     FROM activities a
     JOIN cities c ON c.id = a.city_id
     ${whereClause}
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return {
    results: rows.map(formatActivity),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  unifiedSearch,
};
