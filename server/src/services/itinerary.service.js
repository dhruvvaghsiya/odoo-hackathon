const db = require('../config/db');

// ── SQL fragments ──────────────────────────────────────

const STOP_WITH_CITY = `
  ts.id, ts.trip_id, ts.city_id, ts.start_date, ts.end_date,
  ts.stop_order, ts.notes,
  c.name      AS city_name,
  c.country   AS city_country,
  c.region    AS city_region,
  c.description AS city_description,
  c.image     AS city_image,
  c.cost_index AS city_cost_index,
  c.latitude  AS city_latitude,
  c.longitude AS city_longitude
`;

// ── Helpers ────────────────────────────────────────────

/**
 * Reshape a flat JOIN row into a nested stop + city object.
 */
const formatStop = (row) => ({
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
    description: row.city_description,
    image: row.city_image,
    cost_index: row.city_cost_index,
    latitude: row.city_latitude,
    longitude: row.city_longitude,
  },
});

/**
 * Calculate the number of days between two dates (inclusive).
 * Returns null if either date is missing.
 */
const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Throw an operational error with a status code.
 */
const throwError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// ── REORDER STOPS ──────────────────────────────────────

/**
 * Reorder all stops in a trip atomically.
 *
 * Validations:
 *  1. Trip must exist and be owned by the user.
 *  2. No duplicate IDs in the input array.
 *  3. Every ID must belong to the trip.
 *  4. All existing stops must be represented (no missing IDs).
 *
 * Assigns sequential stop_order starting at 1.
 *
 * @param {string}   tripId
 * @param {string}   userId
 * @param {string[]} orderedStopIds - UUIDs in desired order
 * @returns {Promise<object[]>} reordered stops with city details
 */
const reorderStops = async (tripId, userId, orderedStopIds) => {
  // 1. Verify trip ownership
  const { rows: tripRows } = await db.query(
    'SELECT id, user_id FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = tripRows[0];
  if (!trip || trip.user_id !== userId) {
    throwError(404, 'Trip not found.');
  }

  // 2. Check for duplicate IDs
  const uniqueIds = new Set(orderedStopIds);
  if (uniqueIds.size !== orderedStopIds.length) {
    throwError(400, 'Duplicate stop IDs are not allowed.');
  }

  // 3. Fetch all existing stops for this trip
  const { rows: existingStops } = await db.query(
    'SELECT id FROM trip_stops WHERE trip_id = $1',
    [tripId],
  );

  const existingIds = new Set(existingStops.map((s) => s.id));

  // 4. Every submitted ID must belong to this trip
  for (const id of orderedStopIds) {
    if (!existingIds.has(id)) {
      throwError(400, `Stop "${id}" does not belong to this trip.`);
    }
  }

  // 5. All existing stops must be represented
  if (orderedStopIds.length !== existingIds.size) {
    const missing = [...existingIds].filter((id) => !uniqueIds.has(id));
    throwError(400, `Missing stop IDs: ${missing.join(', ')}. All stops must be included.`);
  }

  // 6. Atomically reorder inside a transaction
  //    We temporarily set stop_order to negative values to avoid
  //    the UNIQUE(trip_id, stop_order) constraint during the swap.
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Phase 1: Set all stop_orders to negative temps (avoids unique constraint clashes)
    for (let i = 0; i < orderedStopIds.length; i++) {
      await client.query(
        'UPDATE trip_stops SET stop_order = $1 WHERE id = $2 AND trip_id = $3',
        [-(i + 1), orderedStopIds[i], tripId],
      );
    }

    // Phase 2: Flip negatives to final positive values
    await client.query(
      `UPDATE trip_stops
       SET stop_order = -stop_order
       WHERE trip_id = $1 AND stop_order < 0`,
      [tripId],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Return the freshly ordered stops
  return getStopsWithCities(tripId);
};

// ── GET FULL ITINERARY ─────────────────────────────────

/**
 * Build a complete itinerary view for a trip.
 *
 * Returns:
 *  - trip info
 *  - ordered stops with city details
 *  - total_days (trip-level)
 *  - number_of_cities (unique cities)
 *  - number_of_stops
 *
 * Accessible by the trip owner or anyone if the trip is public.
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object>} itinerary object
 */
const getItinerary = async (tripId, userId) => {
  // 1. Fetch trip
  const { rows: tripRows } = await db.query(
    `SELECT id, user_id, name, description, cover_photo,
            start_date, end_date, total_budget, currency,
            is_public, created_at, updated_at
     FROM trips WHERE id = $1`,
    [tripId],
  );

  const trip = tripRows[0];
  if (!trip) {
    throwError(404, 'Trip not found.');
  }

  // Ownership / visibility check
  if (trip.user_id !== userId && !trip.is_public) {
    throwError(404, 'Trip not found.');
  }

  // 2. Fetch stops with cities
  const stops = await getStopsWithCities(tripId);

  // 3. Compute summary
  const uniqueCityIds = new Set(stops.map((s) => s.city_id));

  const totalDays = daysBetween(trip.start_date, trip.end_date);

  // Per-stop days
  const stopsWithDays = stops.map((stop) => ({
    ...stop,
    days: daysBetween(stop.start_date, stop.end_date),
  }));

  return {
    trip: {
      id: trip.id,
      user_id: trip.user_id,
      name: trip.name,
      description: trip.description,
      cover_photo: trip.cover_photo,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
      is_public: trip.is_public,
      created_at: trip.created_at,
      updated_at: trip.updated_at,
    },
    stops: stopsWithDays,
    summary: {
      total_days: totalDays,
      number_of_cities: uniqueCityIds.size,
      number_of_stops: stops.length,
    },
  };
};

// ── Shared: fetch ordered stops with city join ─────────

/**
 * @param {string} tripId
 * @returns {Promise<object[]>}
 */
const getStopsWithCities = async (tripId) => {
  const { rows } = await db.query(
    `SELECT ${STOP_WITH_CITY}
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order ASC`,
    [tripId],
  );
  return rows.map(formatStop);
};

module.exports = {
  reorderStops,
  getItinerary,
  getStopsWithCities,
};
