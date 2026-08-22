const db = require('../config/db');

/**
 * Columns returned in trip responses (no joins to stops).
 */
const TRIP_COLUMNS = `
  id, user_id, name, description, cover_photo,
  start_date, end_date, total_budget, currency,
  is_public, created_at, updated_at
`;

// ── CREATE ─────────────────────────────────────────────

/**
 * Insert a new trip owned by `userId`.
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object>} the created trip row
 */
const create = async (userId, data) => {
  const { rows } = await db.query(
    `INSERT INTO trips (user_id, name, description, cover_photo, start_date, end_date, total_budget, currency, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING ${TRIP_COLUMNS}`,
    [
      userId,
      data.name.trim(),
      data.description?.trim() || null,
      data.cover_photo || null,
      data.start_date || null,
      data.end_date || null,
      data.total_budget ?? null,
      data.currency || 'USD',
      data.is_public ?? false,
    ],
  );
  return rows[0];
};

// ── FIND ALL (for a user, with pagination) ─────────────

/**
 * List trips owned by `userId`.
 *
 * @param {string} userId
 * @param {object} opts
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @param {string} [opts.sort]   - created_at | start_date | name (default: created_at)
 * @param {string} [opts.order]  - asc | desc (default: desc)
 * @returns {Promise<{ trips: object[], total: number, page: number, limit: number }>}
 */
const findAllByUser = async (userId, opts = {}) => {
  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const allowedSortColumns = ['created_at', 'start_date', 'name'];
  const sortCol = allowedSortColumns.includes(opts.sort) ? opts.sort : 'created_at';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Count
  const { rows: countRows } = await db.query(
    'SELECT COUNT(*) AS total FROM trips WHERE user_id = $1',
    [userId],
  );
  const total = parseInt(countRows[0].total, 10);

  // Data
  const { rows: trips } = await db.query(
    `SELECT ${TRIP_COLUMNS}
     FROM trips
     WHERE user_id = $1
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return { trips, total, page, limit };
};

// ── FIND BY ID ─────────────────────────────────────────

/**
 * Find a single trip by UUID.
 * Returns the trip regardless of owner — caller must enforce ownership.
 * @param {string} tripId
 * @returns {Promise<object|null>}
 */
const findById = async (tripId) => {
  const { rows } = await db.query(
    `SELECT ${TRIP_COLUMNS} FROM trips WHERE id = $1`,
    [tripId],
  );
  return rows[0] || null;
};

// ── UPDATE ─────────────────────────────────────────────

/**
 * Partially update a trip.
 * Only the supplied keys are updated (PATCH semantics).
 * @param {string} tripId
 * @param {string} userId  - ownership guard
 * @param {object} data    - fields to update
 * @returns {Promise<object|null>}  updated trip or null if not found / not owned
 */
const update = async (tripId, userId, data) => {
  const allowedFields = [
    'name',
    'description',
    'cover_photo',
    'start_date',
    'end_date',
    'total_budget',
    'currency',
    'is_public',
  ];

  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      const value = typeof data[field] === 'string' ? data[field].trim() : data[field];
      params.push(value);
    }
  }

  // Nothing to update
  if (setClauses.length === 0) return findById(tripId);

  // Ownership guard baked into WHERE
  params.push(tripId);   // $N
  params.push(userId);   // $N+1

  const { rows } = await db.query(
    `UPDATE trips
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
     RETURNING ${TRIP_COLUMNS}`,
    params,
  );

  return rows[0] || null;
};

// ── DELETE ─────────────────────────────────────────────

/**
 * Delete a trip (cascade removes trip_stops via FK).
 * Ownership guard is baked into the WHERE clause.
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<boolean>} true if a row was deleted
 */
const remove = async (tripId, userId) => {
  const { rowCount } = await db.query(
    'DELETE FROM trips WHERE id = $1 AND user_id = $2',
    [tripId, userId],
  );
  return rowCount > 0;
};

module.exports = {
  create,
  findAllByUser,
  findById,
  update,
  remove,
};
