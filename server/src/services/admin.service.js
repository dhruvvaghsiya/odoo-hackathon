const db = require('../config/db');

/**
 * Safe user columns — NEVER expose password_hash.
 */
const SAFE_USER_COLUMNS = `
  id, name, email, profile_photo, language, role, created_at, updated_at
`;

// ── GET /api/admin/analytics ───────────────────────────

/**
 * Aggregate platform-wide analytics using PostgreSQL.
 * @returns {Promise<object>}
 */
const getAnalytics = async () => {
  // ── 1. User stats ──────────────────────────────────
  const { rows: userStats } = await db.query(`
    SELECT
      COUNT(*)::int                                          AS total_users,
      COUNT(*) FILTER (WHERE role = 'admin')::int            AS admin_count,
      COUNT(*) FILTER (WHERE role = 'user')::int             AS user_count,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int  AS new_users_7d,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_users_30d
    FROM users
  `);

  // ── 2. Trip stats ──────────────────────────────────
  const { rows: tripStats } = await db.query(`
    SELECT
      COUNT(*)::int                                    AS total_trips,
      COUNT(*) FILTER (WHERE is_public = true)::int    AS public_trips,
      COUNT(*) FILTER (WHERE is_public = false)::int   AS private_trips,
      ROUND(AVG(
        CASE
          WHEN start_date IS NOT NULL AND end_date IS NOT NULL
          THEN (end_date - start_date + 1)
        END
      ), 1)                                            AS avg_trip_duration_days,
      ROUND(AVG(total_budget)::numeric, 2)             AS avg_trip_budget,
      ROUND(MAX(total_budget)::numeric, 2)             AS max_trip_budget,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int  AS new_trips_7d,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS new_trips_30d
    FROM trips
  `);

  // ── 3. Expense stats ───────────────────────────────
  const { rows: expenseStats } = await db.query(`
    SELECT
      COUNT(*)::int                                          AS total_expenses,
      COALESCE(SUM(amount), 0)::numeric(14,2)                AS total_spent,
      ROUND(AVG(amount)::numeric, 2)                         AS avg_expense_amount,
      ROUND(MAX(amount)::numeric, 2)                         AS max_expense_amount
    FROM expenses
  `);

  // ── 4. Expense breakdown by category ───────────────
  const { rows: expenseByCategory } = await db.query(`
    SELECT
      category,
      COUNT(*)::int                              AS count,
      COALESCE(SUM(amount), 0)::numeric(12,2)    AS total
    FROM expenses
    GROUP BY category
    ORDER BY total DESC
  `);

  // ── 5. Popular cities (by trip stop count) ─────────
  const { rows: popularCities } = await db.query(`
    SELECT
      c.id,
      c.name,
      c.country,
      c.image,
      c.popularity,
      COUNT(ts.id)::int AS trip_stop_count
    FROM cities c
    LEFT JOIN trip_stops ts ON ts.city_id = c.id
    GROUP BY c.id
    ORDER BY trip_stop_count DESC, c.popularity DESC
    LIMIT 10
  `);

  // ── 6. Popular activities (by trip activity count) ──
  const { rows: popularActivities } = await db.query(`
    SELECT
      a.id,
      a.name,
      a.type,
      a.cost,
      a.popularity,
      c.name   AS city_name,
      c.country AS city_country,
      COUNT(ta.id)::int AS booked_count
    FROM activities a
    JOIN cities c ON c.id = a.city_id
    LEFT JOIN trip_activities ta ON ta.activity_id = a.id
    GROUP BY a.id, c.name, c.country
    ORDER BY booked_count DESC, a.popularity DESC
    LIMIT 10
  `);

  // ── 7. User engagement ─────────────────────────────
  const { rows: engagement } = await db.query(`
    SELECT
      ROUND(AVG(trip_count)::numeric, 1)     AS avg_trips_per_user,
      MAX(trip_count)::int                    AS max_trips_per_user,
      ROUND(AVG(stop_count)::numeric, 1)     AS avg_stops_per_trip,
      ROUND(AVG(expense_count)::numeric, 1)  AS avg_expenses_per_trip
    FROM (
      SELECT
        u.id,
        COUNT(DISTINCT t.id)::int  AS trip_count,
        COUNT(DISTINCT ts.id)::int AS stop_count,
        COUNT(DISTINCT e.id)::int  AS expense_count
      FROM users u
      LEFT JOIN trips t      ON t.user_id = u.id
      LEFT JOIN trip_stops ts ON ts.trip_id = t.id
      LEFT JOIN expenses e   ON e.trip_id = t.id
      GROUP BY u.id
    ) per_user
  `);

  // ── 8. Trips by currency ───────────────────────────
  const { rows: tripsByCurrency } = await db.query(`
    SELECT
      currency,
      COUNT(*)::int AS count
    FROM trips
    GROUP BY currency
    ORDER BY count DESC
  `);

  // ── Format numeric strings → numbers ───────────────
  const format = (obj) => {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = val !== null && !isNaN(val) ? parseFloat(val) : val;
    }
    return result;
  };

  return {
    users: format(userStats[0]),
    trips: format(tripStats[0]),
    expenses: {
      ...format(expenseStats[0]),
      by_category: expenseByCategory.map((r) => ({
        category: r.category,
        count: r.count,
        total: parseFloat(r.total),
      })),
    },
    popular_cities: popularCities.map((r) => ({
      ...r,
      trip_stop_count: r.trip_stop_count,
    })),
    popular_activities: popularActivities.map((r) => ({
      ...r,
      cost: r.cost !== null ? parseFloat(r.cost) : null,
    })),
    engagement: format(engagement[0]),
    trips_by_currency: tripsByCurrency,
  };
};

// ── GET /api/admin/users ───────────────────────────────

/**
 * List all users with pagination & engagement stats.
 * NEVER returns password_hash.
 *
 * @param {object} opts
 * @param {string} [opts.sort]   - name | email | created_at | role (default: created_at)
 * @param {string} [opts.order]  - asc | desc (default: desc)
 * @param {string} [opts.role]   - user | admin
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @returns {Promise<{ users: object[], total: number, page: number, limit: number }>}
 */
const listUsers = async (opts = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Optional role filter
  if (opts.role && ['user', 'admin'].includes(opts.role)) {
    conditions.push(`u.role = $${paramIndex++}`);
    params.push(opts.role);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  const allowedSorts = ['name', 'email', 'created_at', 'role'];
  const sortCol = allowedSorts.includes(opts.sort) ? `u.${opts.sort}` : 'u.created_at';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Pagination
  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  // Data — join to get trip/expense counts per user
  const { rows } = await db.query(
    `SELECT
       ${SAFE_USER_COLUMNS.split(',').map((c) => `u.${c.trim()}`).join(', ')},
       COUNT(DISTINCT t.id)::int  AS trip_count,
       COUNT(DISTINCT e.id)::int  AS expense_count
     FROM users u
     LEFT JOIN trips t    ON t.user_id = u.id
     LEFT JOIN expenses e ON e.trip_id = t.id
     ${whereClause}
     GROUP BY u.id
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return { users: rows, total, page, limit };
};

// ── GET /api/admin/trips ───────────────────────────────

/**
 * List all trips with owner info and aggregate stats.
 *
 * @param {object} opts
 * @param {string} [opts.sort]      - name | start_date | total_budget | created_at (default: created_at)
 * @param {string} [opts.order]     - asc | desc (default: desc)
 * @param {string} [opts.is_public] - true | false
 * @param {number} [opts.page]
 * @param {number} [opts.limit]
 * @returns {Promise<{ trips: object[], total: number, page: number, limit: number }>}
 */
const listTrips = async (opts = {}) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Optional public filter
  if (opts.is_public === 'true') {
    conditions.push(`t.is_public = true`);
  } else if (opts.is_public === 'false') {
    conditions.push(`t.is_public = false`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  const allowedSorts = ['name', 'start_date', 'total_budget', 'created_at'];
  const sortCol = allowedSorts.includes(opts.sort) ? `t.${opts.sort}` : 't.created_at';
  const sortOrder = opts.order === 'asc' ? 'ASC' : 'DESC';

  // Pagination
  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM trips t ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  // Data — join owner name + aggregate stop/expense counts
  const { rows } = await db.query(
    `SELECT
       t.id, t.name, t.description, t.cover_photo,
       t.start_date, t.end_date, t.total_budget, t.currency,
       t.is_public, t.created_at, t.updated_at,
       u.id   AS owner_id,
       u.name AS owner_name,
       u.email AS owner_email,
       COUNT(DISTINCT ts.id)::int AS stop_count,
       COUNT(DISTINCT e.id)::int  AS expense_count,
       COALESCE(SUM(e.amount), 0)::numeric(12,2) AS total_spent
     FROM trips t
     JOIN users u        ON u.id = t.user_id
     LEFT JOIN trip_stops ts ON ts.trip_id = t.id
     LEFT JOIN expenses e    ON e.trip_id = t.id
     ${whereClause}
     GROUP BY t.id, u.id
     ORDER BY ${sortCol} ${sortOrder}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  // Format numerics
  const trips = rows.map((r) => ({
    ...r,
    total_budget: r.total_budget !== null ? parseFloat(r.total_budget) : null,
    total_spent: parseFloat(r.total_spent),
  }));

  return { trips, total, page, limit };
};

module.exports = {
  getAnalytics,
  listUsers,
  listTrips,
};
