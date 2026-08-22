const db = require('../config/db');

/**
 * Columns returned in activity discovery responses.
 */
const ACTIVITY_COLUMNS = `
  a.id, a.city_id, a.name, a.description, a.image,
  a.type, a.cost, a.duration_minutes, a.popularity,
  a.created_at, a.updated_at
`;

const ACTIVITY_WITH_CITY = `
  ${ACTIVITY_COLUMNS},
  c.name    AS city_name,
  c.country AS city_country
`;

/**
 * Reshape a row from the JOIN query into nested city object.
 */
const formatWithCity = (row) => ({
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
  },
});

// ── LIST ALL (with filters & pagination) ───────────────

/**
 * List activities with optional filters, sorting, and pagination.
 *
 * @param {object}  filters
 * @param {string}  [filters.type]
 * @param {number}  [filters.costMin]
 * @param {number}  [filters.costMax]
 * @param {number}  [filters.durationMin]
 * @param {number}  [filters.durationMax]
 * @param {string}  [filters.sort]   - popularity | cost | duration_minutes | name (default: name)
 * @param {string}  [filters.order]  - asc | desc (default: asc)
 * @param {number}  [filters.page]
 * @param {number}  [filters.limit]
 * @returns {Promise<{ activities: object[], total: number, page: number, limit: number }>}
 */
const findAll = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.type) {
    conditions.push(`a.type = $${paramIndex++}`);
    params.push(filters.type);
  }

  if (filters.costMin != null) {
    conditions.push(`a.cost >= $${paramIndex++}`);
    params.push(filters.costMin);
  }

  if (filters.costMax != null) {
    conditions.push(`a.cost <= $${paramIndex++}`);
    params.push(filters.costMax);
  }

  if (filters.durationMin != null) {
    conditions.push(`a.duration_minutes >= $${paramIndex++}`);
    params.push(filters.durationMin);
  }

  if (filters.durationMax != null) {
    conditions.push(`a.duration_minutes <= $${paramIndex++}`);
    params.push(filters.durationMax);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  const allowedSortColumns = ['popularity', 'cost', 'duration_minutes', 'name'];
  const sortCol = allowedSortColumns.includes(filters.sort)
    ? `a.${filters.sort}`
    : 'a.name';
  const sortOrder = filters.order === 'desc' ? 'DESC' : 'ASC';

  // Pagination
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM activities a ${whereClause}`,
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

  return { activities: rows.map(formatWithCity), total, page, limit };
};

// ── FIND BY ID ─────────────────────────────────────────

/**
 * Find a single activity by UUID, including city info.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT ${ACTIVITY_WITH_CITY}
     FROM activities a
     JOIN cities c ON c.id = a.city_id
     WHERE a.id = $1`,
    [id],
  );
  return rows.length > 0 ? formatWithCity(rows[0]) : null;
};

// ── SEARCH ─────────────────────────────────────────────

/**
 * Search activities by name (case-insensitive contains match).
 *
 * @param {object} opts
 * @param {string} opts.q
 * @param {string} [opts.type]
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @returns {Promise<{ activities: object[], total: number, page: number, limit: number }>}
 */
const search = async ({ q, type, page: rawPage, limit: rawLimit } = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (q) {
    conditions.push(`a.name ILIKE $${paramIndex++}`);
    params.push(`%${q}%`);
  }

  if (type) {
    conditions.push(`a.type = $${paramIndex++}`);
    params.push(type);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(rawPage, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM activities a ${whereClause}`,
    params,
  );
  const total = parseInt(countRows[0].total, 10);

  // Data
  const { rows } = await db.query(
    `SELECT ${ACTIVITY_WITH_CITY}
     FROM activities a
     JOIN cities c ON c.id = a.city_id
     ${whereClause}
     ORDER BY a.popularity DESC, a.name ASC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return { activities: rows.map(formatWithCity), total, page, limit };
};

// ── FIND BY CITY ───────────────────────────────────────

/**
 * List activities for a specific city.
 *
 * @param {string} cityId
 * @param {object} opts
 * @param {string} [opts.type]
 * @param {string} [opts.sort]
 * @param {string} [opts.order]
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @returns {Promise<{ activities: object[], total: number, page: number, limit: number }>}
 */
const findByCityId = async (cityId, opts = {}) => {
  const conditions = [`a.city_id = $1`];
  const params = [cityId];
  let paramIndex = 2;

  if (opts.type) {
    conditions.push(`a.type = $${paramIndex++}`);
    params.push(opts.type);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const allowedSortColumns = ['popularity', 'cost', 'duration_minutes', 'name'];
  const sortCol = allowedSortColumns.includes(opts.sort)
    ? `a.${opts.sort}`
    : 'a.popularity';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*) AS total FROM activities a ${whereClause}`,
    params,
  );
  const total = parseInt(countRows[0].total, 10);

  // Data — no JOIN needed since we already know the city
  const { rows } = await db.query(
    `SELECT ${ACTIVITY_COLUMNS}
     FROM activities a
     ${whereClause}
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return { activities: rows, total, page, limit };
};

module.exports = {
  findAll,
  findById,
  search,
  findByCityId,
};
