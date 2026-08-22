const db = require('../config/db');

// ── Constants ──────────────────────────────────────────

const VALID_TYPES = [
  'TRIP_SHARED',
  'TRIP_COPIED',
  'BUDGET_EXCEEDED',
  'BUDGET_WARNING',
  'UPCOMING_TRIP',
  'SYSTEM',
];

const NOTIFICATION_COLUMNS = `
  id, user_id, type, title, message, is_read, metadata, created_at
`;

// ── CREATE ─────────────────────────────────────────────

/**
 * Create a notification for a user.
 *
 * @param {object} data - { user_id, type, title, message?, metadata? }
 * @returns {Promise<object>}
 */
const create = async (data) => {
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [
      data.user_id,
      data.type,
      data.title,
      data.message || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ],
  );
  return rows[0];
};

// ── FIND ALL (for a user, with pagination) ─────────────

/**
 * List notifications for a user.
 *
 * @param {string} userId
 * @param {object} opts - { is_read?, page?, limit? }
 * @returns {Promise<{ notifications: object[], total: number, unread_count: number, page: number, limit: number }>}
 */
const findAllByUser = async (userId, opts = {}) => {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  // Optional read/unread filter
  if (opts.is_read !== undefined) {
    conditions.push(`is_read = $${paramIndex++}`);
    params.push(opts.is_read === 'true' || opts.is_read === true);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Pagination
  const limit = Math.min(Math.max(parseInt(opts.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(opts.page, 10) || 1, 1);
  const offset = (page - 1) * limit;

  // Count total matching
  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM notifications ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  // Count unread (always for the user, ignoring filters)
  const { rows: unreadRows } = await db.query(
    'SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId],
  );
  const unreadCount = unreadRows[0].unread;

  // Data
  const { rows } = await db.query(
    `SELECT ${NOTIFICATION_COLUMNS}
     FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset],
  );

  return { notifications: rows, total, unread_count: unreadCount, page, limit };
};

// ── MARK ONE AS READ ───────────────────────────────────

/**
 * Mark a single notification as read.
 *
 * @param {string} notificationId
 * @param {string} userId - ownership guard
 * @returns {Promise<object|null>}
 */
const markAsRead = async (notificationId, userId) => {
  const { rows } = await db.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING ${NOTIFICATION_COLUMNS}`,
    [notificationId, userId],
  );
  return rows[0] || null;
};

// ── MARK ALL AS READ ───────────────────────────────────

/**
 * Mark all unread notifications as read for a user.
 *
 * @param {string} userId
 * @returns {Promise<number>} count of updated rows
 */
const markAllAsRead = async (userId) => {
  const { rowCount } = await db.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
  return rowCount;
};

// ── EVENT-BASED NOTIFICATION GENERATORS ────────────────

/**
 * Generate a "budget exceeded" notification.
 * Called from expense.service after creating/updating an expense.
 *
 * @param {string} userId
 * @param {object} trip - { id, name, total_budget, currency }
 * @param {number} totalSpent
 */
const notifyBudgetExceeded = async (userId, trip, totalSpent) => {
  if (!trip.total_budget || totalSpent <= parseFloat(trip.total_budget)) return;

  // Check if we already sent a BUDGET_EXCEEDED for this trip
  const { rows } = await db.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = 'BUDGET_EXCEEDED' AND metadata->>'trip_id' = $2
     LIMIT 1`,
    [userId, trip.id],
  );
  if (rows.length > 0) return; // Already notified

  const overage = (totalSpent - parseFloat(trip.total_budget)).toFixed(2);
  await create({
    user_id: userId,
    type: 'BUDGET_EXCEEDED',
    title: `Budget exceeded on "${trip.name}"`,
    message: `You've spent ${trip.currency} ${totalSpent.toFixed(2)} on "${trip.name}", which is ${trip.currency} ${overage} over your ${trip.currency} ${parseFloat(trip.total_budget).toFixed(2)} budget.`,
    metadata: { trip_id: trip.id, total_budget: trip.total_budget, total_spent: totalSpent },
  });
};

/**
 * Generate a "budget warning" notification at 80% spent.
 *
 * @param {string} userId
 * @param {object} trip
 * @param {number} totalSpent
 */
const notifyBudgetWarning = async (userId, trip, totalSpent) => {
  if (!trip.total_budget) return;
  const budget = parseFloat(trip.total_budget);
  const pct = (totalSpent / budget) * 100;
  if (pct < 80 || pct >= 100) return; // Only warn at 80-99%

  // Check if we already sent a warning
  const { rows } = await db.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = 'BUDGET_WARNING' AND metadata->>'trip_id' = $2
     LIMIT 1`,
    [userId, trip.id],
  );
  if (rows.length > 0) return;

  await create({
    user_id: userId,
    type: 'BUDGET_WARNING',
    title: `Budget alert: ${Math.round(pct)}% spent on "${trip.name}"`,
    message: `You've used ${Math.round(pct)}% of your ${trip.currency} ${budget.toFixed(2)} budget for "${trip.name}". ${trip.currency} ${(budget - totalSpent).toFixed(2)} remaining.`,
    metadata: { trip_id: trip.id, percentage: Math.round(pct) },
  });
};

/**
 * Generate an "upcoming trip" notification.
 * Designed to be called from a scheduled job (cron).
 *
 * @param {string} userId
 * @param {object} trip - { id, name, start_date }
 * @param {number} daysUntil
 */
const notifyUpcomingTrip = async (userId, trip, daysUntil) => {
  // Check if we already notified for this trip + day count
  const { rows } = await db.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = 'UPCOMING_TRIP'
       AND metadata->>'trip_id' = $2
       AND metadata->>'days_until' = $3
     LIMIT 1`,
    [userId, trip.id, String(daysUntil)],
  );
  if (rows.length > 0) return;

  const dayWord = daysUntil === 1 ? 'day' : 'days';
  await create({
    user_id: userId,
    type: 'UPCOMING_TRIP',
    title: `"${trip.name}" starts in ${daysUntil} ${dayWord}!`,
    message: `Your trip "${trip.name}" begins on ${trip.start_date}. Time to finalize your itinerary!`,
    metadata: { trip_id: trip.id, days_until: daysUntil, start_date: trip.start_date },
  });
};

/**
 * Generate a "trip shared" notification.
 *
 * @param {string} recipientUserId
 * @param {string} sharerName
 * @param {object} trip - { id, name }
 */
const notifyTripShared = async (recipientUserId, sharerName, trip) => {
  await create({
    user_id: recipientUserId,
    type: 'TRIP_SHARED',
    title: `${sharerName} shared a trip with you`,
    message: `"${trip.name}" has been shared with you. Check it out!`,
    metadata: { trip_id: trip.id, sharer_name: sharerName },
  });
};

/**
 * Generate a "trip copied" notification (when someone copies a public trip).
 *
 * @param {string} ownerUserId - original trip owner
 * @param {string} copierName
 * @param {object} trip - { id, name }
 */
const notifyTripCopied = async (ownerUserId, copierName, trip) => {
  await create({
    user_id: ownerUserId,
    type: 'TRIP_COPIED',
    title: `Someone copied your trip!`,
    message: `${copierName} copied your public trip "${trip.name}".`,
    metadata: { trip_id: trip.id, copier_name: copierName },
  });
};

module.exports = {
  VALID_TYPES,
  create,
  findAllByUser,
  markAsRead,
  markAllAsRead,
  notifyBudgetExceeded,
  notifyBudgetWarning,
  notifyUpcomingTrip,
  notifyTripShared,
  notifyTripCopied,
};
