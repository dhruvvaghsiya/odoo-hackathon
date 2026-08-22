const db = require('../config/db');

/**
 * Columns returned in stop responses, with city details joined.
 */
const STOP_COLUMNS = `
  ts.id, ts.trip_id, ts.city_id, ts.start_date, ts.end_date,
  ts.stop_order, ts.notes
`;

const STOP_WITH_CITY = `
  ${STOP_COLUMNS},
  c.name   AS city_name,
  c.country AS city_country,
  c.region  AS city_region,
  c.image   AS city_image,
  c.latitude AS city_latitude,
  c.longitude AS city_longitude
`;

// ── Helpers ────────────────────────────────────────────

/**
 * Verify the trip exists and is owned by the given user.
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object|null>} trip row or null
 */
const verifyTripOwnership = async (tripId, userId) => {
  const { rows } = await db.query(
    'SELECT id, user_id, start_date, end_date FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = rows[0];
  if (!trip || trip.user_id !== userId) return null;
  return trip;
};

/**
 * Verify the city exists.
 * @param {string} cityId
 * @returns {Promise<boolean>}
 */
const cityExists = async (cityId) => {
  const { rows } = await db.query(
    'SELECT id FROM cities WHERE id = $1',
    [cityId],
  );
  return rows.length > 0;
};

/**
 * Reshape a row from the JOIN query into nested city object.
 */
const formatStopWithCity = (row) => ({
  id: row.id,
  trip_id: row.trip_id,
  city_id: row.city_id,
  start_date: row.start_date,
  end_date: row.end_date,
  stop_order: row.stop_order,
  notes: row.notes,
  city: {
    id: row.city_id,
    name: row.city_name,
    country: row.city_country,
    region: row.city_region,
    image: row.city_image,
    latitude: row.city_latitude,
    longitude: row.city_longitude,
  },
});

/**
 * Get the current total stop count for a trip.
 * @param {import('pg').PoolClient|object} client  DB client or pool
 * @param {string} tripId
 * @returns {Promise<number>}
 */
const getStopCount = async (client, tripId) => {
  const { rows } = await client.query(
    'SELECT COUNT(*)::int AS count FROM trip_stops WHERE trip_id = $1',
    [tripId],
  );
  return rows[0].count;
};

// ── Date / overlap validation ──────────────────────────

/**
 * Validate that stop dates fall within the trip's date range.
 * Throws an operational error (statusCode 400) if invalid.
 */
const validateStopDatesWithinTrip = (stopData, trip) => {
  const stopStart = stopData.start_date ? new Date(stopData.start_date) : null;
  const stopEnd = stopData.end_date ? new Date(stopData.end_date) : null;
  const tripStart = trip.start_date ? new Date(trip.start_date) : null;
  const tripEnd = trip.end_date ? new Date(trip.end_date) : null;

  // start_date <= end_date
  if (stopStart && stopEnd && stopStart > stopEnd) {
    const err = new Error('Stop start_date must be on or before end_date.');
    err.statusCode = 400;
    throw err;
  }

  // Stop start must be within trip range
  if (stopStart && tripStart && stopStart < tripStart) {
    const err = new Error(
      `Stop start_date (${stopData.start_date}) cannot be before the trip start_date (${trip.start_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }
  if (stopStart && tripEnd && stopStart > tripEnd) {
    const err = new Error(
      `Stop start_date (${stopData.start_date}) cannot be after the trip end_date (${trip.end_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }

  // Stop end must be within trip range
  if (stopEnd && tripStart && stopEnd < tripStart) {
    const err = new Error(
      `Stop end_date (${stopData.end_date}) cannot be before the trip start_date (${trip.start_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }
  if (stopEnd && tripEnd && stopEnd > tripEnd) {
    const err = new Error(
      `Stop end_date (${stopData.end_date}) cannot be after the trip end_date (${trip.end_date}).`,
    );
    err.statusCode = 400;
    throw err;
  }
};

/**
 * Detect whether a new/updated stop's date range overlaps with existing stops.
 *
 * Two stops overlap when:
 *   new.start_date <= existing.end_date AND new.end_date >= existing.start_date
 *
 * Stops without dates are excluded from overlap checks.
 *
 * @param {import('pg').PoolClient} client  - transaction client
 * @param {string} tripId
 * @param {string|null} excludeStopId  - stop to exclude (for updates)
 * @param {string|null} startDate
 * @param {string|null} endDate
 */
const detectOverlap = async (client, tripId, excludeStopId, startDate, endDate) => {
  if (!startDate && !endDate) return; // No dates → skip overlap check

  const effectiveStart = startDate || endDate;  // single-day if only one date
  const effectiveEnd = endDate || startDate;

  let sql = `
    SELECT ts.stop_order, c.name AS city_name
    FROM trip_stops ts
    JOIN cities c ON c.id = ts.city_id
    WHERE ts.trip_id = $1
      AND ts.start_date IS NOT NULL
      AND ts.end_date IS NOT NULL
      AND ts.start_date <= $2::date
      AND ts.end_date   >= $3::date
  `;
  const params = [tripId, effectiveEnd, effectiveStart];

  if (excludeStopId) {
    sql += ' AND ts.id != $4';
    params.push(excludeStopId);
  }

  const { rows } = await client.query(sql, params);

  if (rows.length > 0) {
    const conflicting = rows
      .map((r) => `stop #${r.stop_order} (${r.city_name})`)
      .join(', ');
    const err = new Error(
      `Date range overlaps with existing stop(s): ${conflicting}.`,
    );
    err.statusCode = 400;
    throw err;
  }
};

// ── CREATE ─────────────────────────────────────────────

/**
 * Add a new stop to a trip.
 *
 * Uses a transaction to atomically shift existing stop_order values
 * when inserting into the middle of the itinerary.
 *
 * @param {string} tripId
 * @param {string} userId  - for ownership check
 * @param {object} data    - { city_id, start_date?, end_date?, stop_order?, notes? }
 * @returns {Promise<object>} created stop with city details
 */
const create = async (tripId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  // Verify city exists
  if (!(await cityExists(data.city_id))) {
    const err = new Error('City not found.');
    err.statusCode = 404;
    throw err;
  }

  // Validate stop dates are within trip dates
  validateStopDatesWithinTrip(data, trip);

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Check for date overlap with existing stops
    await detectOverlap(client, tripId, null, data.start_date, data.end_date);

    // Determine stop_order
    const totalStops = await getStopCount(client, tripId);
    let stopOrder = data.stop_order;

    if (stopOrder === undefined || stopOrder === null) {
      // Auto-assign: next available order
      stopOrder = totalStops + 1;
    } else {
      // Validate stop_order is within valid range
      const maxAllowed = totalStops + 1;
      if (stopOrder > maxAllowed) {
        const err = new Error(
          `stop_order ${stopOrder} is out of range. Maximum allowed is ${maxAllowed}.`,
        );
        err.statusCode = 400;
        throw err;
      }

      // Shift existing stops at or after this position
      await client.query(
        `UPDATE trip_stops
         SET stop_order = stop_order + 1
         WHERE trip_id = $1 AND stop_order >= $2`,
        [tripId, stopOrder],
      );
    }

    // Insert
    const { rows } = await client.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${STOP_COLUMNS.replace(/ts\./g, '')}`,
      [
        tripId,
        data.city_id,
        data.start_date || null,
        data.end_date || null,
        stopOrder,
        data.notes?.trim() || null,
      ],
    );

    await client.query('COMMIT');

    // Fetch with city details
    return findById(rows[0].id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── FIND ALL ───────────────────────────────────────────

/**
 * List all stops for a trip, ordered by stop_order.
 * Includes city details.
 *
 * @param {string} tripId
 * @param {string} userId - for ownership check
 * @returns {Promise<object[]>}
 */
const findAllByTrip = async (tripId, userId) => {
  // Check ownership or public trip
  const { rows: tripRows } = await db.query(
    'SELECT id, user_id, is_public FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = tripRows[0];
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }
  if (trip.user_id !== userId && !trip.is_public) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const { rows } = await db.query(
    `SELECT ${STOP_WITH_CITY}
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order ASC`,
    [tripId],
  );

  return rows.map(formatStopWithCity);
};

// ── FIND BY ID ─────────────────────────────────────────

/**
 * Find a single stop with city details.
 * @param {string} stopId
 * @returns {Promise<object|null>}
 */
const findById = async (stopId) => {
  const { rows } = await db.query(
    `SELECT ${STOP_WITH_CITY}
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.id = $1`,
    [stopId],
  );
  return rows.length > 0 ? formatStopWithCity(rows[0]) : null;
};

// ── UPDATE ─────────────────────────────────────────────

/**
 * Partially update a stop.
 *
 * If stop_order changes, uses a transaction to reorder atomically.
 * Detects date overlaps with sibling stops.
 *
 * @param {string} stopId
 * @param {string} tripId
 * @param {string} userId
 * @param {object} data - { city_id?, start_date?, end_date?, stop_order?, notes? }
 * @returns {Promise<object|null>}
 */
const update = async (stopId, tripId, userId, data) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  // Verify stop belongs to this trip
  const { rows: stopRows } = await db.query(
    'SELECT id, stop_order, start_date, end_date FROM trip_stops WHERE id = $1 AND trip_id = $2',
    [stopId, tripId],
  );
  if (stopRows.length === 0) {
    const err = new Error('Stop not found.');
    err.statusCode = 404;
    throw err;
  }

  const existingStop = stopRows[0];

  // Verify city if changing
  if (data.city_id !== undefined) {
    if (!(await cityExists(data.city_id))) {
      const err = new Error('City not found.');
      err.statusCode = 404;
      throw err;
    }
  }

  // Validate stop dates within trip (merge with existing dates for partial updates)
  const effectiveStartDate = data.start_date !== undefined ? data.start_date : existingStop.start_date;
  const effectiveEndDate = data.end_date !== undefined ? data.end_date : existingStop.end_date;
  validateStopDatesWithinTrip(
    { start_date: effectiveStartDate, end_date: effectiveEndDate },
    trip,
  );

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Check for date overlap (excluding this stop itself)
    if (data.start_date !== undefined || data.end_date !== undefined) {
      await detectOverlap(client, tripId, stopId, effectiveStartDate, effectiveEndDate);
    }

    // Handle reordering if stop_order changes
    if (data.stop_order !== undefined && data.stop_order !== existingStop.stop_order) {
      const totalStops = await getStopCount(client, tripId);
      const oldOrder = existingStop.stop_order;
      const newOrder = data.stop_order;

      // Validate new order is within range
      if (newOrder > totalStops) {
        const err = new Error(
          `stop_order ${newOrder} is out of range. Maximum allowed is ${totalStops}.`,
        );
        err.statusCode = 400;
        throw err;
      }

      if (newOrder > oldOrder) {
        // Moving down: shift stops between old+1..new up by -1
        await client.query(
          `UPDATE trip_stops
           SET stop_order = stop_order - 1
           WHERE trip_id = $1 AND stop_order > $2 AND stop_order <= $3 AND id != $4`,
          [tripId, oldOrder, newOrder, stopId],
        );
      } else {
        // Moving up: shift stops between new..old-1 down by +1
        await client.query(
          `UPDATE trip_stops
           SET stop_order = stop_order + 1
           WHERE trip_id = $1 AND stop_order >= $2 AND stop_order < $3 AND id != $4`,
          [tripId, newOrder, oldOrder, stopId],
        );
      }
    }

    // Build dynamic SET clause
    const allowedFields = ['city_id', 'start_date', 'end_date', 'stop_order', 'notes'];
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
      return findById(stopId);
    }

    params.push(stopId);
    params.push(tripId);

    await client.query(
      `UPDATE trip_stops
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex++} AND trip_id = $${paramIndex++}`,
      params,
    );

    await client.query('COMMIT');
    return findById(stopId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── DELETE ─────────────────────────────────────────────

/**
 * Delete a stop and re-compact stop_order values.
 * Uses a transaction to keep ordering consistent.
 *
 * @param {string} stopId
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<boolean>} true if deleted
 */
const remove = async (stopId, tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Get the stop's current order before deleting
    const { rows: stopRows } = await client.query(
      'SELECT stop_order FROM trip_stops WHERE id = $1 AND trip_id = $2',
      [stopId, tripId],
    );

    if (stopRows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const deletedOrder = stopRows[0].stop_order;

    // Delete the stop
    await client.query(
      'DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2',
      [stopId, tripId],
    );

    // Re-compact: shift stops after the deleted one down by 1
    await client.query(
      `UPDATE trip_stops
       SET stop_order = stop_order - 1
       WHERE trip_id = $1 AND stop_order > $2`,
      [tripId, deletedOrder],
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
  findAllByTrip,
  findById,
  update,
  remove,
};
