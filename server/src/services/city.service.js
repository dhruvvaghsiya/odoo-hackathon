const db = require('../config/db');

/**
 * Columns returned in city list/detail responses.
 */
const CITY_COLUMNS = `
  id, name, country, region, description, image,
  cost_index, popularity, latitude, longitude
`;

// ── GET /api/cities ────────────────────────────────────
// Supports: ?country=, ?region=, ?cost_min=, ?cost_max=,
//           ?sort=popularity|cost_index|name, ?order=asc|desc,
//           ?page=, ?limit=

/**
 * List cities with optional filters, sorting, and pagination.
 * @param {object}  filters
 * @param {string}  [filters.country]
 * @param {string}  [filters.region]
 * @param {number}  [filters.costMin]
 * @param {number}  [filters.costMax]
 * @param {string}  [filters.sort]      - popularity | cost_index | name (default: name)
 * @param {string}  [filters.order]     - asc | desc (default: asc)
 * @param {number}  [filters.page]      - 1-based (default: 1)
 * @param {number}  [filters.limit]     - max 100 (default: 20)
 * @returns {Promise<{ cities: object[], total: number, page: number, limit: number }>}
 */
const findAll = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // ── Dynamic WHERE clauses ──────────────────────────
  if (filters.country) {
    conditions.push(`LOWER(country) = LOWER($${paramIndex++})`);
    params.push(filters.country);
  }

  if (filters.region) {
    conditions.push(`LOWER(region) = LOWER($${paramIndex++})`);
    params.push(filters.region);
  }

  if (filters.costMin != null) {
    conditions.push(`cost_index >= $${paramIndex++}`);
    params.push(filters.costMin);
  }

  if (filters.costMax != null) {
    conditions.push(`cost_index <= $${paramIndex++}`);
    params.push(filters.costMax);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // ── Sorting ────────────────────────────────────────
  const allowedSortColumns = ['popularity', 'cost_index', 'name'];
  const sortCol = allowedSortColumns.includes(filters.sort)
    ? filters.sort
    : 'name';
  const sortOrder = filters.order === 'desc' ? 'DESC' : 'ASC';

  // ── Pagination ─────────────────────────────────────
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // ── Count total matching rows ──────────────────────
  const countQuery = `SELECT COUNT(*) AS total FROM cities ${whereClause}`;
  const { rows: countRows } = await db.query(countQuery, params);
  const total = parseInt(countRows[0].total, 10);

  // ── Fetch page ─────────────────────────────────────
  const dataQuery = `
    SELECT ${CITY_COLUMNS}
    FROM cities
    ${whereClause}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const { rows: cities } = await db.query(dataQuery, [
    ...params,
    limit,
    offset,
  ]);

  return { cities, total, page, limit };
};

// ── GET /api/cities/:id ────────────────────────────────

/**
 * Find a single city by UUID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT ${CITY_COLUMNS} FROM cities WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
};

// ── GET /api/cities/search?q= ──────────────────────────

/**
 * Search cities by name (case-insensitive prefix / contains match).
 * Also supports optional country & region filters.
 * @param {object}  opts
 * @param {string}  opts.q          - search term
 * @param {string}  [opts.country]
 * @param {string}  [opts.region]
 * @param {number}  [opts.page]
 * @param {number}  [opts.limit]
 * @returns {Promise<{ cities: object[], total: number, page: number, limit: number }>}
 */
const search = async ({ q, country, region, page: rawPage, limit: rawLimit } = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // ── Full-text-ish search on name ───────────────────
  if (q) {
    conditions.push(`name ILIKE $${paramIndex++}`);
    params.push(`%${q}%`);
  }

  if (country) {
    conditions.push(`LOWER(country) = LOWER($${paramIndex++})`);
    params.push(country);
  }

  if (region) {
    conditions.push(`LOWER(region) = LOWER($${paramIndex++})`);
    params.push(region);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(rawPage, 10) || 1, 1);
  const offset = (page - 1) * limit;

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
     ORDER BY name ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return { cities, total, page, limit };
};

// ── GET /api/cities/popular ────────────────────────────

/**
 * Return the top N cities by popularity score.
 * @param {number} [limit=10]
 * @returns {Promise<object[]>}
 */
const findPopular = async (limit = 10) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const { rows } = await db.query(
    `SELECT ${CITY_COLUMNS}
     FROM cities
     ORDER BY popularity DESC
     LIMIT $1`,
    [safeLimit],
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  search,
  findPopular,
};
