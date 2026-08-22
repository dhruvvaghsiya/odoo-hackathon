const db = require('../config/db');

// ── SQL fragments ──────────────────────────────────────

const TA_WITH_DETAILS = `
  ta.id, ta.trip_stop_id, ta.activity_id, ta.activity_date,
  ta.start_time, ta.end_time, ta.activity_order, ta.notes,
  ta.estimated_cost,
  a.name             AS activity_name,
  a.type             AS activity_type,
  a.description      AS activity_description,
  a.image            AS activity_image,
  a.cost             AS activity_cost,
  a.duration_minutes AS activity_duration_minutes
`;

// ── Helpers ────────────────────────────────────────────

const throwError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

/**
 * Reshape a JOIN row into a nested trip_activity + activity object.
 */
const formatActivity = (row) => ({
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
 * Parse a TIME string "HH:MM" or "HH:MM:SS" into total minutes since midnight.
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

/**
 * Generate all dates between two Date-parseable values (inclusive).
 * Returns ISO date strings (YYYY-MM-DD).
 */
const dateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

// ── REORDER ACTIVITIES ─────────────────────────────────

/**
 * Reorder all activities within a single trip.
 *
 * The input is an array of trip_activity IDs in desired order.
 * All activities must belong to stops of the given trip.
 *
 * Validations:
 *  1. Trip exists and is owned by the user.
 *  2. No duplicate IDs.
 *  3. Every activity belongs to a stop within this trip.
 *  4. All existing activities are represented.
 *  5. Activity dates must fall within their stop's date range.
 *  6. start_time < end_time for each activity (DB constraint, re-checked).
 *  7. No obvious same-day time overlaps within the same stop.
 *  8. Sequential activity_order is maintained per stop.
 *
 * @param {string}   tripId
 * @param {string}   userId
 * @param {string[]} orderedActivityIds — all trip_activity UUIDs in desired order
 * @returns {Promise<object[]>} reordered activities grouped by stop
 */
const reorderActivities = async (tripId, userId, orderedActivityIds) => {
  // 1. Verify trip ownership
  const { rows: tripRows } = await db.query(
    'SELECT id, user_id FROM trips WHERE id = $1',
    [tripId],
  );
  const trip = tripRows[0];
  if (!trip || trip.user_id !== userId) {
    throwError(404, 'Trip not found.');
  }

  // 2. No duplicate IDs
  const uniqueIds = new Set(orderedActivityIds);
  if (uniqueIds.size !== orderedActivityIds.length) {
    throwError(400, 'Duplicate activity IDs are not allowed.');
  }

  // 3. Fetch all existing trip_activities for this trip (via trip_stops)
  const { rows: existingActivities } = await db.query(
    `SELECT ta.id, ta.trip_stop_id, ta.activity_date, ta.start_time, ta.end_time,
            ts.start_date AS stop_start_date, ts.end_date AS stop_end_date
     FROM trip_activities ta
     JOIN trip_stops ts ON ts.id = ta.trip_stop_id
     WHERE ts.trip_id = $1`,
    [tripId],
  );

  const existingMap = new Map(existingActivities.map((a) => [a.id, a]));
  const existingIds = new Set(existingMap.keys());

  // 4. Every submitted ID must belong to this trip
  for (const id of orderedActivityIds) {
    if (!existingIds.has(id)) {
      throwError(400, `Activity "${id}" does not belong to this trip.`);
    }
  }

  // 5. All existing activities must be represented
  if (orderedActivityIds.length !== existingIds.size) {
    const missing = [...existingIds].filter((id) => !uniqueIds.has(id));
    throwError(400, `Missing activity IDs: ${missing.join(', ')}. All activities must be included.`);
  }

  // 6 & 7. Build the new ordering grouped by stop, then validate
  //   Group by trip_stop_id in the new order
  const stopGroups = new Map(); // stopId -> [{ id, index }]
  for (let i = 0; i < orderedActivityIds.length; i++) {
    const activityId = orderedActivityIds[i];
    const existing = existingMap.get(activityId);
    const stopId = existing.trip_stop_id;

    if (!stopGroups.has(stopId)) {
      stopGroups.set(stopId, []);
    }
    stopGroups.get(stopId).push({
      id: activityId,
      activity_date: existing.activity_date,
      start_time: existing.start_time,
      end_time: existing.end_time,
      stop_start_date: existing.stop_start_date,
      stop_end_date: existing.stop_end_date,
    });
  }

  // Validate each stop group
  for (const [stopId, activities] of stopGroups) {
    // 6. Validate activity_date within stop date range
    for (const act of activities) {
      if (act.activity_date && act.stop_start_date) {
        const actDate = new Date(act.activity_date);
        const stopStart = new Date(act.stop_start_date);
        if (actDate < stopStart) {
          throwError(400,
            `Activity "${act.id}" date is before its stop's start_date.`);
        }
      }
      if (act.activity_date && act.stop_end_date) {
        const actDate = new Date(act.activity_date);
        const stopEnd = new Date(act.stop_end_date);
        if (actDate > stopEnd) {
          throwError(400,
            `Activity "${act.id}" date is after its stop's end_date.`);
        }
      }

      // Validate start_time < end_time
      if (act.start_time && act.end_time) {
        const startMins = timeToMinutes(act.start_time);
        const endMins = timeToMinutes(act.end_time);
        if (startMins >= endMins) {
          throwError(400,
            `Activity "${act.id}" end_time must be after start_time.`);
        }
      }
    }

    // 7. Check for same-day time overlaps within this stop
    const byDate = new Map(); // date -> [{ start, end, id }]
    for (const act of activities) {
      if (!act.activity_date || !act.start_time || !act.end_time) continue;
      const dateKey = new Date(act.activity_date).toISOString().slice(0, 10);
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey).push({
        id: act.id,
        start: timeToMinutes(act.start_time),
        end: timeToMinutes(act.end_time),
      });
    }

    for (const [date, dayActivities] of byDate) {
      // Sort by start time
      dayActivities.sort((a, b) => a.start - b.start);
      for (let i = 1; i < dayActivities.length; i++) {
        if (dayActivities[i].start < dayActivities[i - 1].end) {
          throwError(400,
            `Time overlap on ${date} in stop "${stopId}": ` +
            `activity "${dayActivities[i - 1].id}" overlaps with "${dayActivities[i].id}".`);
        }
      }
    }
  }

  // 8. Atomically reorder with two-phase update (negative temp orders)
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // For each stop group, assign sequential activity_order
    for (const [stopId, activities] of stopGroups) {
      // Phase 1: negative temps
      for (let i = 0; i < activities.length; i++) {
        await client.query(
          'UPDATE trip_activities SET activity_order = $1 WHERE id = $2 AND trip_stop_id = $3',
          [-(i + 1), activities[i].id, stopId],
        );
      }

      // Phase 2: flip to positive
      await client.query(
        `UPDATE trip_activities
         SET activity_order = -activity_order
         WHERE trip_stop_id = $1 AND activity_order < 0`,
        [stopId],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Return freshly ordered activities
  return getAllActivitiesForTrip(tripId);
};

// ── TIMELINE ───────────────────────────────────────────

/**
 * Build a day-by-day timeline for a trip.
 *
 * Returns an array of day objects, each containing:
 *  - date
 *  - city (from the stop that covers this date)
 *  - activities (scheduled for this date, ordered by start_time then activity_order)
 *  - daily_cost (sum of estimated_cost for the day)
 *
 * Also returns trip-level summary.
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getTimeline = async (tripId, userId) => {
  // 1. Fetch trip
  const { rows: tripRows } = await db.query(
    `SELECT id, user_id, name, description, cover_photo,
            start_date, end_date, total_budget, currency,
            is_public, created_at, updated_at
     FROM trips WHERE id = $1`,
    [tripId],
  );

  const trip = tripRows[0];
  if (!trip) throwError(404, 'Trip not found.');
  if (trip.user_id !== userId && !trip.is_public) throwError(404, 'Trip not found.');

  // 2. Fetch all stops with cities
  const { rows: stops } = await db.query(
    `SELECT ts.id, ts.trip_id, ts.city_id, ts.start_date, ts.end_date,
            ts.stop_order, ts.notes,
            c.name AS city_name, c.country AS city_country,
            c.region AS city_region, c.image AS city_image,
            c.latitude AS city_latitude, c.longitude AS city_longitude
     FROM trip_stops ts
     JOIN cities c ON c.id = ts.city_id
     WHERE ts.trip_id = $1
     ORDER BY ts.stop_order ASC`,
    [tripId],
  );

  // 3. Fetch all trip_activities with activity details
  const { rows: rawActivities } = await db.query(
    `SELECT ${TA_WITH_DETAILS}
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.trip_stop_id = ANY($1::uuid[])
     ORDER BY ta.activity_date ASC NULLS LAST, ta.start_time ASC NULLS LAST, ta.activity_order ASC`,
    [stops.map((s) => s.id)],
  );

  const activities = rawActivities.map(formatActivity);

  // 4. If trip has no date range, return a flat structure
  if (!trip.start_date || !trip.end_date) {
    return buildFlatTimeline(trip, stops, activities);
  }

  // 5. Build day-by-day timeline
  const days = dateRange(trip.start_date, trip.end_date);

  // Map: date → stop (find which stop covers each date)
  const stopForDate = (date) => {
    const d = new Date(date);
    for (const stop of stops) {
      if (!stop.start_date || !stop.end_date) continue;
      const sStart = new Date(stop.start_date);
      const sEnd = new Date(stop.end_date);
      if (d >= sStart && d <= sEnd) return stop;
    }
    return null;
  };

  // Index activities by date
  const activitiesByDate = new Map();
  for (const act of activities) {
    if (!act.activity_date) continue;
    const dateKey = new Date(act.activity_date).toISOString().slice(0, 10);
    if (!activitiesByDate.has(dateKey)) activitiesByDate.set(dateKey, []);
    activitiesByDate.get(dateKey).push(act);
  }

  const timeline = days.map((date, index) => {
    const stop = stopForDate(date);
    const dayActivities = activitiesByDate.get(date) || [];

    const dailyCost = dayActivities.reduce((sum, a) => {
      return sum + (parseFloat(a.estimated_cost) || 0);
    }, 0);

    return {
      day_number: index + 1,
      date,
      city: stop ? {
        id: stop.city_id,
        name: stop.city_name,
        country: stop.city_country,
        region: stop.city_region,
        image: stop.city_image,
        latitude: stop.city_latitude,
        longitude: stop.city_longitude,
      } : null,
      stop_id: stop ? stop.id : null,
      activities: dayActivities.map((a) => ({
        id: a.id,
        activity_order: a.activity_order,
        start_time: a.start_time,
        end_time: a.end_time,
        estimated_cost: a.estimated_cost,
        notes: a.notes,
        activity: a.activity,
      })),
      activity_count: dayActivities.length,
      daily_cost: Math.round(dailyCost * 100) / 100,
    };
  });

  // Collect unscheduled activities (no activity_date)
  const unscheduled = activities.filter((a) => !a.activity_date);

  const totalCost = timeline.reduce((sum, day) => sum + day.daily_cost, 0)
    + unscheduled.reduce((sum, a) => sum + (parseFloat(a.estimated_cost) || 0), 0);

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
    },
    timeline,
    unscheduled: unscheduled.length > 0 ? unscheduled : undefined,
    summary: {
      total_days: days.length,
      total_activities: activities.length,
      scheduled_activities: activities.length - unscheduled.length,
      unscheduled_activities: unscheduled.length,
      total_estimated_cost: Math.round(totalCost * 100) / 100,
      number_of_cities: new Set(stops.map((s) => s.city_id)).size,
    },
  };
};

/**
 * Flat timeline for trips without date ranges.
 * Groups activities by stop instead of by date.
 */
const buildFlatTimeline = (trip, stops, activities) => {
  // Group activities by trip_stop_id
  const actByStop = new Map();
  for (const act of activities) {
    const key = act.trip_stop_id;
    if (!actByStop.has(key)) actByStop.set(key, []);
    actByStop.get(key).push(act);
  }

  const stopsWithActivities = stops.map((stop) => {
    const stopActivities = actByStop.get(stop.id) || [];
    const stopCost = stopActivities.reduce(
      (sum, a) => sum + (parseFloat(a.estimated_cost) || 0), 0);

    return {
      stop_id: stop.id,
      stop_order: stop.stop_order,
      start_date: stop.start_date,
      end_date: stop.end_date,
      city: {
        id: stop.city_id,
        name: stop.city_name,
        country: stop.city_country,
        region: stop.city_region,
        image: stop.city_image,
        latitude: stop.city_latitude,
        longitude: stop.city_longitude,
      },
      activities: stopActivities.map((a) => ({
        id: a.id,
        activity_order: a.activity_order,
        activity_date: a.activity_date,
        start_time: a.start_time,
        end_time: a.end_time,
        estimated_cost: a.estimated_cost,
        notes: a.notes,
        activity: a.activity,
      })),
      activity_count: stopActivities.length,
      stop_cost: Math.round(stopCost * 100) / 100,
    };
  });

  const totalCost = stopsWithActivities.reduce((sum, s) => sum + s.stop_cost, 0);

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
    },
    timeline: null,
    stops: stopsWithActivities,
    summary: {
      total_days: null,
      total_activities: activities.length,
      total_estimated_cost: Math.round(totalCost * 100) / 100,
      number_of_cities: new Set(stops.map((s) => s.city_id)).size,
    },
  };
};

// ── Shared helper ──────────────────────────────────────

/**
 * Fetch all trip_activities for a trip with activity details.
 */
const getAllActivitiesForTrip = async (tripId) => {
  const { rows: stopIds } = await db.query(
    'SELECT id FROM trip_stops WHERE trip_id = $1 ORDER BY stop_order ASC',
    [tripId],
  );

  if (stopIds.length === 0) return [];

  const { rows } = await db.query(
    `SELECT ${TA_WITH_DETAILS}
     FROM trip_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.trip_stop_id = ANY($1::uuid[])
     ORDER BY ta.trip_stop_id, ta.activity_order ASC`,
    [stopIds.map((s) => s.id)],
  );

  return rows.map(formatActivity);
};

module.exports = {
  reorderActivities,
  getTimeline,
  getAllActivitiesForTrip,
};
