const db = require('../config/db');

/**
 * Columns returned in trip_activity responses.
 */
const TA_COLUMNS = `
  ta.id, ta.trip_stop_id, ta.activity_id, ta.activity_date,
  ta.start_time, ta.end_time, ta.activity_order, ta.notes,
  ta.estimated_cost
`;

const TA_WITH_ACTIVITY = `
  ${TA_COLUMNS},
  a.name            AS activity_name,
  a.type            AS activity_type,
  a.description     AS activity_description,
  a.image           AS activity_image,
  a.cost            AS activity_cost,
  a.duration_minutes AS activity_duration_minutes
`;

// ── Helpers ────────────────────────────────────────────

/**
 * Reshape a row from the JOIN query into nested activity object.
 */
const formatWithActivity = (row) => ({
  id: row.id,
  trip_stop_id: row.trip_stop_id,
  activity_id: row.activity_id,
  activity_date: row.activity_date,
  start_time: row.start_time,
  end_time: row.end_time,
  activity_order: row.activity_order,
  notes: row.notes,
  estimated_cost: row.estimated_cost,
  activity: {
    id: row.activity_id,
    name: row.activity_name,
    type: row.activity_type,
    description: row.activity_description,
    image: row.activity_image,
    cost: row.activity_cost,
    duration_minutes: row.activity_duration_minutes,
  },
});

/**
 * Verify the trip exists and is owned by the given user.
 * @returns {Promise<object|null>}
 */
const verifyTripOwnership = async (tripId, userId) => {
  const { rows } = await db.query(
    'SELECT id, user_id FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = rows[0];
  if (!trip || trip.user_id !== userId) return null;
  return trip;
};

/**
 * Verify the stop belongs to the given trip.
 * @returns {Promise<object|null>}
 */
const verifyStopBelongsToTrip = async (stopId, tripId) => {
  const { rows } = await db.query(
    'SELECT id, trip_id FROM trip_stops WHERE id = $1 AND trip_id = $2',
    [stopId, tripId],
  );
  return rows[0] || null;
};

/**
 * Verify that the referenced activity exists.
 * @returns {Promise<boolean>}
 */
const activityExists = async (activityId) => {
  const { rows } = await db.query(
    'SELECT id FROM activities WHERE id = $1',
    [activityId],
  );
  return rows.length > 0;
};

/**
 * Get current count of activities in a trip stop.
 */
const getActivityCount = async (client, tripStopId) => {
  const { rows } = await client.query(
    'SELECT COUNT(*)::int AS count FROM trip_activities WHERE trip_stop_id = $1',
    [tripStopId],
  );
  return rows[0].count;
};

// ── CREATE ─────────────────────────────────────────────

/**
 * Add an activity to a trip stop.
 *
 * @param {string} tripId
 * @param {string} stopId
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
const create = async (tripId, stopId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const stop = await verifyStopBelongsToTrip(stopId, tripId);
  if (!stop) {
    const err = new Error('Stop not found in this trip.');
    err.statusCode = 404;
    throw err;
  }

  if (!(await activityExists(data.activity_id))) {
    const err = new Error('Activity not found.');
    err.statusCode = 404;
    throw err;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Determine activity_order
    const totalActivities = await getActivityCount(client, stopId);
    let activityOrder = data.activity_order;

    if (activityOrder === undefined || activityOrder === null) {
      activityOrder = totalActivities + 1;
    } else {
      const maxAllowed = totalActivities + 1;
      if (activityOrder > maxAllowed) {
        const err = new Error(
          `activity_order ${activityOrder} is out of range. Maximum allowed is ${maxAllowed}.`,
        );
        err.statusCode = 400;
        throw err;
      }

      // Shift existing activities at or after this position
      await client.query(
        `UPDATE trip_activities
         SET activity_order = activity_order + 1
         WHERE trip_stop_id = $1 AND activity_order >= $2`,
        [stopId, activityOrder],
      );
    }

    const { rows } = await client.query(
      `INSERT INTO trip_activities
         (trip_stop_id, activity_id, activity_date, start_time, end_time, activity_order, notes, estimated_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${TA_COLUMNS.replace(/ta\./g, '')}`,
      [
        stopId,
        data.activity_id,
        data.activity_date || null,
        data.start_time || null,
        data.end_time || null,
        activityOrder,
        data.notes?.trim() || null,
        data.estimated_cost ?? null,
      ],
    );

    await client.query('COMMIT');

    // Return with activity details
    return findById(rows[0].id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── FIND ALL BY STOP ───────────────────────────────────

/**
 * List all activities for a trip stop, ordered by activity_order.
 *
 * @param {string} tripId
 * @param {string} stopId
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const findAllByStop = async (tripId, stopId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const stop = await verifyStopBelongsToTrip(stopId, tripId);
  if (!stop) {
    const err = new Error('Stop not found in this trip.');
    err.statusCode = 404;
    throw err;
  }

  const { rows } = await db.query(
    `SELECT ${TA_WITH_ACTIVITY}
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.trip_stop_id = $1
     ORDER BY ta.activity_order ASC`,
    [stopId],
  );

  return rows.map(formatWithActivity);
};

// ── FIND BY ID ─────────────────────────────────────────

/**
 * Find a single trip activity with activity details.
 * @param {string} tripActivityId
 * @returns {Promise<object|null>}
 */
const findById = async (tripActivityId) => {
  const { rows } = await db.query(
    `SELECT ${TA_WITH_ACTIVITY}
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.id = $1`,
    [tripActivityId],
  );
  return rows.length > 0 ? formatWithActivity(rows[0]) : null;
};

// ── UPDATE ─────────────────────────────────────────────

/**
 * Partially update a trip activity.
 *
 * @param {string} tripActivityId
 * @param {string} tripId
 * @param {string} stopId
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object|null>}
 */
const update = async (tripActivityId, tripId, stopId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const stop = await verifyStopBelongsToTrip(stopId, tripId);
  if (!stop) {
    const err = new Error('Stop not found in this trip.');
    err.statusCode = 404;
    throw err;
  }

  // Verify this trip_activity belongs to this stop
  const { rows: taRows } = await db.query(
    'SELECT id, activity_order FROM trip_activities WHERE id = $1 AND trip_stop_id = $2',
    [tripActivityId, stopId],
  );
  if (taRows.length === 0) {
    const err = new Error('Activity not found in this stop.');
    err.statusCode = 404;
    throw err;
  }

  const existing = taRows[0];

  // If changing activity_id, verify the new one exists
  if (data.activity_id !== undefined) {
    if (!(await activityExists(data.activity_id))) {
      const err = new Error('Activity not found.');
      err.statusCode = 404;
      throw err;
    }
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Handle reordering if activity_order changes
    if (data.activity_order !== undefined && data.activity_order !== existing.activity_order) {
      const totalActivities = await getActivityCount(client, stopId);
      const oldOrder = existing.activity_order;
      const newOrder = data.activity_order;

      if (newOrder > totalActivities) {
        const err = new Error(
          `activity_order ${newOrder} is out of range. Maximum allowed is ${totalActivities}.`,
        );
        err.statusCode = 400;
        throw err;
      }

      if (newOrder > oldOrder) {
        await client.query(
          `UPDATE trip_activities
           SET activity_order = activity_order - 1
           WHERE trip_stop_id = $1 AND activity_order > $2 AND activity_order <= $3 AND id != $4`,
          [stopId, oldOrder, newOrder, tripActivityId],
        );
      } else {
        await client.query(
          `UPDATE trip_activities
           SET activity_order = activity_order + 1
           WHERE trip_stop_id = $1 AND activity_order >= $2 AND activity_order < $3 AND id != $4`,
          [stopId, newOrder, oldOrder, tripActivityId],
        );
      }
    }

    // Build dynamic SET clause
    const allowedFields = [
      'activity_id', 'activity_date', 'start_time', 'end_time',
      'activity_order', 'notes', 'estimated_cost',
    ];
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex++}`);
        const value = field === 'notes' && typeof data[field] === 'string'
          ? data[field].trim()
          : data[field];
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      await client.query('COMMIT');
      return findById(tripActivityId);
    }

    params.push(tripActivityId);
    params.push(stopId);

    await client.query(
      `UPDATE trip_activities
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex++} AND trip_stop_id = $${paramIndex++}`,
      params,
    );

    await client.query('COMMIT');
    return findById(tripActivityId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── DELETE ─────────────────────────────────────────────

/**
 * Delete a trip activity and re-compact ordering.
 *
 * @param {string} tripActivityId
 * @param {string} tripId
 * @param {string} stopId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const remove = async (tripActivityId, tripId, stopId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const stop = await verifyStopBelongsToTrip(stopId, tripId);
  if (!stop) {
    const err = new Error('Stop not found in this trip.');
    err.statusCode = 404;
    throw err;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT activity_order FROM trip_activities WHERE id = $1 AND trip_stop_id = $2',
      [tripActivityId, stopId],
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const deletedOrder = rows[0].activity_order;

    await client.query(
      'DELETE FROM trip_activities WHERE id = $1 AND trip_stop_id = $2',
      [tripActivityId, stopId],
    );

    // Re-compact ordering
    await client.query(
      `UPDATE trip_activities
       SET activity_order = activity_order - 1
       WHERE trip_stop_id = $1 AND activity_order > $2`,
      [stopId, deletedOrder],
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  create,
  findAllByStop,
  findById,
  update,
  remove,
};
