const db = require('../config/db');

// ── Constants ──────────────────────────────────────────

const VALID_CATEGORIES = ['TRANSPORT', 'STAY', 'ACTIVITY', 'MEAL', 'OTHER'];

const EXPENSE_COLUMNS = `
  id, trip_id, category, amount, currency,
  expense_date, description, created_at, updated_at
`;

// ── Helpers ────────────────────────────────────────────

/**
 * Verify trip exists and is owned by user.
 * @returns {Promise<object|null>} trip row or null
 */
const verifyTripOwnership = async (tripId, userId) => {
  const { rows } = await db.query(
    'SELECT id, user_id, start_date, end_date, total_budget, currency FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = rows[0];
  if (!trip || trip.user_id !== userId) return null;
  return trip;
};

// ── CREATE ─────────────────────────────────────────────

/**
 * Add an expense to a trip.
 *
 * @param {string} tripId
 * @param {string} userId
 * @param {object} data - { category, amount, currency?, expense_date?, description? }
 * @returns {Promise<object>}
 */
const create = async (tripId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(data.category)) {
    const err = new Error(
      `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    );
    err.statusCode = 400;
    throw err;
  }

  // Validate expense_date within trip range
  if (data.expense_date) {
    validateExpenseDateWithinTrip(data.expense_date, trip);
  }

  const { rows } = await db.query(
    `INSERT INTO expenses (trip_id, category, amount, currency, expense_date, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${EXPENSE_COLUMNS}`,
    [
      tripId,
      data.category,
      data.amount,
      data.currency || trip.currency || 'USD',
      data.expense_date || null,
      data.description?.trim() || null,
    ],
  );

  return formatExpense(rows[0]);
};

// ── FIND ALL ───────────────────────────────────────────

/**
 * List expenses for a trip with optional filters.
 *
 * @param {string} tripId
 * @param {string} userId
 * @param {object} opts - { category?, sort?, order?, page?, limit? }
 * @returns {Promise<{ expenses: object[], total: number, page: number, limit: number }>}
 */
const findAllByTrip = async (tripId, userId, opts = {}) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const conditions = ['trip_id = $1'];
  const params = [tripId];
  let paramIndex = 2;

  // Optional category filter
  if (opts.category) {
    if (!VALID_CATEGORIES.includes(opts.category)) {
      const err = new Error(
        `Invalid category filter. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      );
      err.statusCode = 400;
      throw err;
    }
    conditions.push(`category = $${paramIndex++}`);
    params.push(opts.category);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Sorting
  const allowedSorts = ['expense_date', 'amount', 'category', 'created_at'];
  const sortCol = allowedSorts.includes(opts.sort) ? opts.sort : 'expense_date';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Pagination
  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM expenses ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  // Data
  const { rows } = await db.query(
    `SELECT ${EXPENSE_COLUMNS}
     FROM expenses
     ${whereClause}
     ORDER BY ${sortCol} ${sortOrder} NULLS LAST
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return {
    expenses: rows.map(formatExpense),
    total,
    page,
    limit,
  };
};

// ── FIND BY ID ─────────────────────────────────────────

/**
 * Find a single expense.
 * @param {string} expenseId
 * @param {string} tripId
 * @returns {Promise<object|null>}
 */
const findById = async (expenseId, tripId) => {
  const { rows } = await db.query(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE id = $1 AND trip_id = $2`,
    [expenseId, tripId],
  );
  return rows.length > 0 ? formatExpense(rows[0]) : null;
};

// ── UPDATE ─────────────────────────────────────────────

/**
 * Partially update an expense.
 *
 * @param {string} expenseId
 * @param {string} tripId
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const update = async (expenseId, tripId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  // Verify expense belongs to trip
  const existing = await findById(expenseId, tripId);
  if (!existing) {
    const err = new Error('Expense not found.');
    err.statusCode = 404;
    throw err;
  }

  // Validate category if provided
  if (data.category !== undefined && !VALID_CATEGORIES.includes(data.category)) {
    const err = new Error(
      `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
    );
    err.statusCode = 400;
    throw err;
  }

  // Validate expense_date if provided
  if (data.expense_date !== undefined && data.expense_date !== null) {
    validateExpenseDateWithinTrip(data.expense_date, trip);
  }

  // Build dynamic SET
  const allowedFields = ['category', 'amount', 'currency', 'expense_date', 'description'];
  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      const value = field === 'description' && typeof data[field] === 'string'
        ? data[field].trim()
        : data[field];
      params.push(value);
    }
  }

  if (setClauses.length === 0) return existing;

  params.push(expenseId);
  params.push(tripId);

  const { rows } = await db.query(
    `UPDATE expenses
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex++} AND trip_id = $${paramIndex++}
     RETURNING ${EXPENSE_COLUMNS}`,
    params,
  );

  return rows.length > 0 ? formatExpense(rows[0]) : null;
};

// ── DELETE ─────────────────────────────────────────────

/**
 * Delete an expense.
 *
 * @param {string} expenseId
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const remove = async (expenseId, tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const { rowCount } = await db.query(
    'DELETE FROM expenses WHERE id = $1 AND trip_id = $2',
    [expenseId, tripId],
  );
  return rowCount > 0;
};

// ── BUDGET SUMMARY ─────────────────────────────────────

/**
 * Calculate a full budget summary for a trip.
 *
 * All monetary calculations happen in PostgreSQL using NUMERIC to avoid
 * JavaScript floating-point precision issues.
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getBudgetSummary = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  // Total spent + count (safe NUMERIC aggregation)
  const { rows: totalRows } = await db.query(
    `SELECT
       COALESCE(SUM(amount), 0)::numeric(12,2) AS total_spent,
       COUNT(*)::int                             AS expense_count
     FROM expenses
     WHERE trip_id = $1`,
    [tripId],
  );

  const totalSpent = parseFloat(totalRows[0].total_spent);
  const expenseCount = totalRows[0].expense_count;
  const totalBudget = trip.total_budget ? parseFloat(trip.total_budget) : null;

  // Remaining & percentage
  const remaining = totalBudget !== null
    ? Math.round((totalBudget - totalSpent) * 100) / 100
    : null;
  const percentageUsed = totalBudget !== null && totalBudget > 0
    ? Math.round((totalSpent / totalBudget) * 10000) / 100  // 2 decimal %
    : null;

  // Category breakdown (all aggregation in SQL)
  const { rows: categoryRows } = await db.query(
    `SELECT
       category,
       COALESCE(SUM(amount), 0)::numeric(12,2) AS total,
       COUNT(*)::int                             AS count
     FROM expenses
     WHERE trip_id = $1
     GROUP BY category
     ORDER BY total DESC`,
    [tripId],
  );

  const categoryBreakdown = categoryRows.map((r) => ({
    category: r.category,
    total: parseFloat(r.total),
    count: r.count,
    percentage: totalSpent > 0
      ? Math.round((parseFloat(r.total) / totalSpent) * 10000) / 100
      : 0,
  }));

  // Average daily cost
  let averageDailyCost = null;
  if (trip.start_date && trip.end_date) {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const tripDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    averageDailyCost = Math.round((totalSpent / tripDays) * 100) / 100;
  }

  return {
    trip_id: tripId,
    currency: trip.currency,
    total_budget: totalBudget,
    total_spent: totalSpent,
    remaining,
    percentage_used: percentageUsed,
    expense_count: expenseCount,
    average_daily_cost: averageDailyCost,
    trip_days: trip.start_date && trip.end_date
      ? Math.max(1, Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1)
      : null,
    category_breakdown: categoryBreakdown,
  };
};

// ── Validation helpers ─────────────────────────────────

const validateExpenseDateWithinTrip = (expenseDate, trip) => {
  const eDate = new Date(expenseDate);
  const tripStart = trip.start_date ? new Date(trip.start_date) : null;
  const tripEnd = trip.end_date ? new Date(trip.end_date) : null;

  if (tripStart && eDate < tripStart) {
    const err = new Error(
      `Expense date (${expenseDate}) cannot be before the trip start date (${trip.start_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }
  if (tripEnd && eDate > tripEnd) {
    const err = new Error(
      `Expense date (${expenseDate}) cannot be after the trip end date (${trip.end_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Format amount as number (pg returns numeric as string).
 */
const formatExpense = (row) => ({
  ...row,
  amount: parseFloat(row.amount),
});

module.exports = {
  VALID_CATEGORIES,
  create,
  findAllByTrip,
  findById,
  update,
  remove,
  getBudgetSummary,
};
