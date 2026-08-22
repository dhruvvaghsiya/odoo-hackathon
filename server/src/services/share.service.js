const crypto = require('crypto');
const db = require('../config/db');
const { getStopsWithCities } = require('./itinerary.service');

// ── Token generation ───────────────────────────────────

/**
 * Generate a cryptographically secure URL-safe token.
 * @param {number} [bytes=32] — produces a 64-char hex string by default
 * @returns {string}
 */
const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// ── Helpers ────────────────────────────────────────────

const throwError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

const verifyTripOwnership = async (tripId, userId) => {
  const { rows } = await db.query(
    'SELECT id, user_id FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = rows[0];
  if (!trip || trip.user_id !== userId) return null;
  return trip;
};

// ── CREATE SHARE ───────────────────────────────────────

/**
 * Create a public share link for a trip.
 * If a share already exists, return the existing one.
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object>} share record
 */
const createShare = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) throwError(404, 'Trip not found.');

  // Check if share already exists
  const { rows: existing } = await db.query(
    'SELECT id, trip_id, public_token, is_active, created_at, updated_at FROM trip_shares WHERE trip_id = $1',
    [tripId],
  );

  if (existing.length > 0) {
    // Re-activate if it was deactivated
    if (!existing[0].is_active) {
      const { rows } = await db.query(
        `UPDATE trip_shares SET is_active = true
         WHERE trip_id = $1
         RETURNING id, trip_id, public_token, is_active, created_at, updated_at`,
        [tripId],
      );
      return rows[0];
    }
    return existing[0];
  }

  // Create new share with a secure token
  const token = generateToken();
  const { rows } = await db.query(
    `INSERT INTO trip_shares (trip_id, public_token)
     VALUES ($1, $2)
     RETURNING id, trip_id, public_token, is_active, created_at, updated_at`,
    [tripId, token],
  );

  return rows[0];
};

// ── UPDATE SHARE ───────────────────────────────────────

/**
 * Toggle the is_active flag on a share.
 *
 * @param {string} tripId
 * @param {string} userId
 * @param {object} data - { is_active: boolean }
 * @returns {Promise<object|null>}
 */
const updateShare = async (tripId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) throwError(404, 'Trip not found.');

  const { rows: existing } = await db.query(
    'SELECT id FROM trip_shares WHERE trip_id = $1',
    [tripId],
  );

  if (existing.length === 0) {
    throwError(404, 'No share link exists for this trip. Create one first.');
  }

  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  if (data.is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`);
    params.push(data.is_active);
  }

  if (setClauses.length === 0) {
    // Nothing to update — return existing
    const { rows } = await db.query(
      'SELECT id, trip_id, public_token, is_active, created_at, updated_at FROM trip_shares WHERE trip_id = $1',
      [tripId],
    );
    return rows[0];
  }

  params.push(tripId);

  const { rows } = await db.query(
    `UPDATE trip_shares
     SET ${setClauses.join(', ')}
     WHERE trip_id = $${paramIndex}
     RETURNING id, trip_id, public_token, is_active, created_at, updated_at`,
    params,
  );

  return rows[0] || null;
};

// ── DELETE SHARE ───────────────────────────────────────

/**
 * Permanently delete a share link.
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const deleteShare = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) throwError(404, 'Trip not found.');

  const { rowCount } = await db.query(
    'DELETE FROM trip_shares WHERE trip_id = $1',
    [tripId],
  );

  return rowCount > 0;
};

// ── GET SHARE STATUS ───────────────────────────────────

/**
 * Get the share record for a trip (owner only).
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getShare = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) throwError(404, 'Trip not found.');

  const { rows } = await db.query(
    'SELECT id, trip_id, public_token, is_active, created_at, updated_at FROM trip_shares WHERE trip_id = $1',
    [tripId],
  );

  return rows[0] || null;
};

// ── PUBLIC: GET TRIP BY TOKEN ──────────────────────────

/**
 * Fetch a public itinerary by its share token.
 * Returns trip + stops + summary — never leaks private user data.
 *
 * @param {string} token
 * @returns {Promise<object>}
 */
const getPublicTrip = async (token) => {
  // Find the share record
  const { rows: shareRows } = await db.query(
    `SELECT ts.id, ts.trip_id, ts.is_active
     FROM trip_shares ts
     WHERE ts.public_token = $1`,
    [token],
  );

  if (shareRows.length === 0) {
    throwError(404, 'Shared trip not found or link has expired.');
  }

  const share = shareRows[0];
  if (!share.is_active) {
    throwError(404, 'This share link has been deactivated.');
  }

  // Fetch trip (minimal — no user_id leak)
  const { rows: tripRows } = await db.query(
    `SELECT t.id, t.name, t.description, t.cover_photo,
            t.start_date, t.end_date, t.total_budget, t.currency,
            t.created_at,
            u.name AS author_name
     FROM trips t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = $1`,
    [share.trip_id],
  );

  if (tripRows.length === 0) {
    throwError(404, 'Shared trip not found.');
  }

  const trip = tripRows[0];

  // Fetch stops with cities (reuse itinerary helper)
  const stops = await getStopsWithCities(share.trip_id);

  // Fetch activities for each stop
  const { rows: activities } = await db.query(
    `SELECT ta.id, ta.trip_stop_id, ta.activity_id, ta.activity_date,
            ta.start_time, ta.end_time, ta.activity_order, ta.notes,
            ta.estimated_cost,
            a.name AS activity_name, a.type AS activity_type,
            a.description AS activity_description, a.image AS activity_image,
            a.cost AS activity_cost, a.duration_minutes AS activity_duration_minutes
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.trip_stop_id = ANY($1)
     ORDER BY ta.trip_stop_id, ta.activity_order ASC`,
    [stops.map((s) => s.id)],
  );

  // Group activities by stop
  const activitiesByStop = {};
  for (const act of activities) {
    if (!activitiesByStop[act.trip_stop_id]) {
      activitiesByStop[act.trip_stop_id] = [];
    }
    activitiesByStop[act.trip_stop_id].push({
      id: act.id,
      activity_id: act.activity_id,
      activity_date: act.activity_date,
      start_time: act.start_time,
      end_time: act.end_time,
      activity_order: act.activity_order,
      notes: act.notes,
      estimated_cost: act.estimated_cost,
      activity: {
        id: act.activity_id,
        name: act.activity_name,
        type: act.activity_type,
        description: act.activity_description,
        image: act.activity_image,
        cost: act.activity_cost,
        duration_minutes: act.activity_duration_minutes,
      },
    });
  }

  // Compute days
  const daysBetween = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
  };

  const stopsWithDetails = stops.map((stop) => ({
    ...stop,
    days: daysBetween(stop.start_date, stop.end_date),
    activities: activitiesByStop[stop.id] || [],
  }));

  const uniqueCityIds = new Set(stops.map((s) => s.city_id));

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      cover_photo: trip.cover_photo,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
      created_at: trip.created_at,
      author_name: trip.author_name,
    },
    stops: stopsWithDetails,
    summary: {
      total_days: daysBetween(trip.start_date, trip.end_date),
      number_of_cities: uniqueCityIds.size,
      number_of_stops: stops.length,
      number_of_activities: activities.length,
    },
  };
};

// ── PUBLIC: COPY TRIP ──────────────────────────────────

/**
 * Copy a publicly shared trip into the authenticated user's account.
 * Uses a transaction to atomically create the trip + stops + trip_activities.
 *
 * @param {string} token  - public share token
 * @param {string} userId - authenticated user performing the copy
 * @returns {Promise<object>} the newly created trip
 */
const copyPublicTrip = async (token, userId) => {
  // Verify the share is valid and active
  const { rows: shareRows } = await db.query(
    'SELECT trip_id, is_active FROM trip_shares WHERE public_token = $1',
    [token],
  );

  if (shareRows.length === 0) {
    throwError(404, 'Shared trip not found or link has expired.');
  }
  if (!shareRows[0].is_active) {
    throwError(404, 'This share link has been deactivated.');
  }

  const sourceTripId = shareRows[0].trip_id;

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // ── 1. Copy the trip ────────────────────────────
    const { rows: tripRows } = await client.query(
      `INSERT INTO trips (user_id, name, description, cover_photo, start_date, end_date, total_budget, currency, is_public)
       SELECT $1, name || ' (copy)', description, cover_photo, start_date, end_date, total_budget, currency, false
       FROM trips
       WHERE id = $2
       RETURNING id, user_id, name, description, cover_photo, start_date, end_date,
                 total_budget, currency, is_public, created_at, updated_at`,
      [userId, sourceTripId],
    );

    if (tripRows.length === 0) {
      throwError(404, 'Source trip no longer exists.');
    }

    const newTrip = tripRows[0];

    // ── 2. Copy stops ───────────────────────────────
    const { rows: sourceStops } = await client.query(
      `SELECT id, city_id, start_date, end_date, stop_order, notes
       FROM trip_stops
       WHERE trip_id = $1
       ORDER BY stop_order ASC`,
      [sourceTripId],
    );

    // Map old stop IDs to new stop IDs (for trip_activities)
    const stopIdMap = new Map();

    for (const stop of sourceStops) {
      const { rows: newStopRows } = await client.query(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [newTrip.id, stop.city_id, stop.start_date, stop.end_date, stop.stop_order, stop.notes],
      );
      stopIdMap.set(stop.id, newStopRows[0].id);
    }

    // ── 3. Copy trip_activities ──────────────────────
    if (stopIdMap.size > 0) {
      const oldStopIds = [...stopIdMap.keys()];

      const { rows: sourceActivities } = await client.query(
        `SELECT trip_stop_id, activity_id, activity_date, start_time, end_time,
                activity_order, notes, estimated_cost
         FROM trip_activities
         WHERE trip_stop_id = ANY($1)
         ORDER BY trip_stop_id, activity_order ASC`,
        [oldStopIds],
      );

      for (const act of sourceActivities) {
        const newStopId = stopIdMap.get(act.trip_stop_id);
        await client.query(
          `INSERT INTO trip_activities
             (trip_stop_id, activity_id, activity_date, start_time, end_time, activity_order, notes, estimated_cost)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            newStopId,
            act.activity_id,
            act.activity_date,
            act.start_time,
            act.end_time,
            act.activity_order,
            act.notes,
            act.estimated_cost,
          ],
        );
      }
    }

    await client.query('COMMIT');

    return newTrip;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createShare,
  updateShare,
  deleteShare,
  getShare,
  getPublicTrip,
  copyPublicTrip,
};
