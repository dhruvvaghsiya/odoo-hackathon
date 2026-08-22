/**
 * GlobeTrotter — Trip & Stop Validation Test Script
 *
 * Exercises all validation scenarios for trips and stops.
 * Requires the server to be running on http://localhost:5000
 * and the database seeded (npm run db:reset).
 *
 * Usage:  node tests/trip-stop-validation.test.js
 */

const BASE = 'http://localhost:5000/api';

// ── Helpers ────────────────────────────────────────────

let passed = 0;
let failed = 0;

const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const auth = (token) => ({
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
});

const get = (url, token) => fetch(url, auth(token));

const post = (url, body, token) =>
  fetch(url, { ...json(body), ...auth(token) });

const patch = (url, body, token) =>
  fetch(url, { method: 'PATCH', ...json(body), ...auth(token) });

const del = (url, token) =>
  fetch(url, { method: 'DELETE', ...auth(token) });

const assert = (condition, label) => {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
};

// ── Main ───────────────────────────────────────────────

const run = async () => {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  GlobeTrotter — Trip & Stop Validation Tests');
  console.log('═══════════════════════════════════════════════\n');

  // ── Setup: Register/login two users ─────────────────
  console.log('── Setup ──────────────────────────────────────');

  const signupRes1 = await fetch(`${BASE}/auth/signup`, json({
    name: 'Test User A',
    email: `testa_${Date.now()}@test.com`,
    password: 'testpass123',
  }));
  const { data: user1Data } = await signupRes1.json();
  const tokenA = user1Data.token;
  assert(tokenA, 'User A registered');

  const signupRes2 = await fetch(`${BASE}/auth/signup`, json({
    name: 'Test User B',
    email: `testb_${Date.now()}@test.com`,
    password: 'testpass123',
  }));
  const { data: user2Data } = await signupRes2.json();
  const tokenB = user2Data.token;
  assert(tokenB, 'User B registered');

  // Get a city for stops
  const citiesRes = await get(`${BASE}/cities`, tokenA);
  const citiesBody = await citiesRes.json();
  const cities = citiesBody.data.cities;
  assert(cities.length >= 3, `Found ${cities.length} cities`);

  const city1 = cities[0];
  const city2 = cities[1];
  const city3 = cities[2];

  // ═════════════════════════════════════════════════════
  // 1. TRIP VALIDATION
  // ═════════════════════════════════════════════════════
  console.log('\n── 1. Trip Validation ─────────────────────────');

  // 1a. Missing name
  let res = await post(`${BASE}/trips`, {}, tokenA);
  let body = await res.json();
  assert(res.status === 400, `Missing name → 400 (got ${res.status})`);
  assert(body.success === false, 'Returns success: false');

  // 1b. end_date before start_date
  res = await post(`${BASE}/trips`, {
    name: 'Bad Date Trip',
    start_date: '2026-08-20',
    end_date: '2026-08-10',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `end < start → 400 (got ${res.status})`);

  // 1c. Negative budget
  res = await post(`${BASE}/trips`, {
    name: 'Negative Budget',
    total_budget: -100,
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `Negative budget → 400 (got ${res.status})`);

  // 1d. Invalid currency (not 3 chars)
  res = await post(`${BASE}/trips`, {
    name: 'Bad Currency',
    currency: 'ABCD',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `4-char currency → 400 (got ${res.status})`);

  // 1e. Valid trip creation
  res = await post(`${BASE}/trips`, {
    name: 'Test Trip Alpha',
    start_date: '2026-08-01',
    end_date: '2026-08-20',
    total_budget: 2000,
    currency: 'USD',
  }, tokenA);
  body = await res.json();
  assert(res.status === 201, `Valid trip → 201 (got ${res.status})`);
  const tripA = body.data.trip;
  assert(tripA.id, 'Trip has UUID');

  // 1f. Second trip for user A (no dates)
  res = await post(`${BASE}/trips`, {
    name: 'Test Trip Beta — No Dates',
  }, tokenA);
  body = await res.json();
  const tripNoDates = body.data.trip;
  assert(res.status === 201, 'Trip without dates → 201');

  // ═════════════════════════════════════════════════════
  // 2. OWNERSHIP CHECKS
  // ═════════════════════════════════════════════════════
  console.log('\n── 2. Ownership Checks ────────────────────────');

  // 2a. User B cannot see User A's private trip
  res = await get(`${BASE}/trips/${tripA.id}`, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B GET private trip → 404 (got ${res.status})`);

  // 2b. User B cannot update User A's trip
  res = await patch(`${BASE}/trips/${tripA.id}`, { name: 'Hacked!' }, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B PATCH trip → 404 (got ${res.status})`);

  // 2c. User B cannot delete User A's trip
  res = await del(`${BASE}/trips/${tripA.id}`, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B DELETE trip → 404 (got ${res.status})`);

  // 2d. Unauthenticated access
  res = await fetch(`${BASE}/trips`, { method: 'GET' });
  assert(res.status === 401, `No auth → 401 (got ${res.status})`);

  // ═════════════════════════════════════════════════════
  // 3. STOP — CITY EXISTENCE
  // ═════════════════════════════════════════════════════
  console.log('\n── 3. Stop — City Existence ───────────────────');

  // 3a. Non-existent city
  const fakeCityId = '00000000-0000-0000-0000-000000000000';
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: fakeCityId,
    start_date: '2026-08-01',
    end_date: '2026-08-03',
  }, tokenA);
  body = await res.json();
  assert(res.status === 404, `Fake city → 404 (got ${res.status})`);

  // 3b. Invalid UUID
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: 'not-a-uuid',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `Invalid UUID → 400 (got ${res.status})`);

  // ═════════════════════════════════════════════════════
  // 4. STOP — DATE VALIDATION
  // ═════════════════════════════════════════════════════
  console.log('\n── 4. Stop — Date Validation ──────────────────');

  // 4a. Stop end_date before start_date
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    start_date: '2026-08-10',
    end_date: '2026-08-05',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `end < start → 400 (got ${res.status})`);
  assert(body.message.includes('on or before'), `Error mentions date ordering`);

  // 4b. Stop start_date before trip start_date
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    start_date: '2026-07-20',
    end_date: '2026-08-03',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `Before trip start → 400 (got ${res.status})`);

  // 4c. Stop end_date after trip end_date
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    start_date: '2026-08-15',
    end_date: '2026-09-01',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `After trip end → 400 (got ${res.status})`);

  // 4d. Valid stop (within trip dates)
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    start_date: '2026-08-01',
    end_date: '2026-08-05',
    notes: 'First stop',
  }, tokenA);
  body = await res.json();
  assert(res.status === 201, `Valid stop 1 → 201 (got ${res.status})`);
  const stop1 = body.data.stop;
  assert(stop1.stop_order === 1, `Auto-assigned order = 1 (got ${stop1.stop_order})`);
  assert(stop1.city.name, `City details included: ${stop1.city.name}`);

  // ═════════════════════════════════════════════════════
  // 5. STOP — OVERLAP DETECTION
  // ═════════════════════════════════════════════════════
  console.log('\n── 5. Stop — Overlap Detection ────────────────');

  // 5a. Exact same dates → overlap
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city2.id,
    start_date: '2026-08-01',
    end_date: '2026-08-05',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `Exact overlap → 400 (got ${res.status})`);
  assert(body.message.includes('overlap'), `Error mentions overlap: "${body.message}"`);

  // 5b. Partial overlap (new starts during existing)
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city2.id,
    start_date: '2026-08-03',
    end_date: '2026-08-08',
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `Partial overlap → 400 (got ${res.status})`);

  // 5c. Non-overlapping → success
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city2.id,
    start_date: '2026-08-06',
    end_date: '2026-08-10',
    notes: 'Second stop',
  }, tokenA);
  body = await res.json();
  assert(res.status === 201, `Non-overlapping stop 2 → 201 (got ${res.status})`);
  const stop2 = body.data.stop;
  assert(stop2.stop_order === 2, `Auto-assigned order = 2 (got ${stop2.stop_order})`);

  // 5d. Third stop, also non-overlapping
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city3.id,
    start_date: '2026-08-11',
    end_date: '2026-08-15',
    notes: 'Third stop',
  }, tokenA);
  body = await res.json();
  assert(res.status === 201, `Non-overlapping stop 3 → 201 (got ${res.status})`);
  const stop3 = body.data.stop;

  // 5e. Stops without dates should not trigger overlap
  res = await post(`${BASE}/trips/${tripNoDates.id}/stops`, {
    city_id: city1.id,
    notes: 'No dates here',
  }, tokenA);
  body = await res.json();
  assert(res.status === 201, `Stop without dates → 201 (got ${res.status})`);

  // ═════════════════════════════════════════════════════
  // 6. STOP ORDERING
  // ═════════════════════════════════════════════════════
  console.log('\n── 6. Stop Ordering ───────────────────────────');

  // 6a. List stops — should be in order
  res = await get(`${BASE}/trips/${tripA.id}/stops`, tokenA);
  body = await res.json();
  const stops = body.data.stops;
  assert(stops.length === 3, `3 stops returned (got ${stops.length})`);
  assert(stops[0].stop_order === 1, 'First stop order = 1');
  assert(stops[1].stop_order === 2, 'Second stop order = 2');
  assert(stops[2].stop_order === 3, 'Third stop order = 3');

  // 6b. Invalid stop_order (too high)
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    stop_order: 99,
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `stop_order 99 → 400 (got ${res.status})`);
  assert(body.message.includes('out of range'), `Error mentions range: "${body.message}"`);

  // 6c. Invalid stop_order (zero)
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    stop_order: 0,
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `stop_order 0 → 400 (got ${res.status})`);

  // 6d. Invalid stop_order (negative)
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
    stop_order: -1,
  }, tokenA);
  body = await res.json();
  assert(res.status === 400, `stop_order -1 → 400 (got ${res.status})`);

  // ═════════════════════════════════════════════════════
  // 7. REORDERING STOPS
  // ═════════════════════════════════════════════════════
  console.log('\n── 7. Reordering Stops ────────────────────────');

  // Move stop 3 → position 1
  res = await patch(
    `${BASE}/trips/${tripA.id}/stops/${stop3.id}`,
    { stop_order: 1 },
    tokenA,
  );
  body = await res.json();
  assert(res.status === 200, `Move stop to pos 1 → 200 (got ${res.status})`);
  assert(body.data.stop.stop_order === 1, 'Moved stop now at order 1');

  // Verify all orders after reorder
  res = await get(`${BASE}/trips/${tripA.id}/stops`, tokenA);
  body = await res.json();
  const reordered = body.data.stops;
  const orders = reordered.map((s) => s.stop_order);
  assert(
    JSON.stringify(orders) === JSON.stringify([1, 2, 3]),
    `Orders are [1,2,3] after reorder (got [${orders}])`,
  );

  // The stop we moved should now be first
  assert(reordered[0].id === stop3.id, 'Stop3 is now first');

  // ═════════════════════════════════════════════════════
  // 8. UNAUTHORIZED STOP ACCESS
  // ═════════════════════════════════════════════════════
  console.log('\n── 8. Unauthorized Stop Access ────────────────');

  // 8a. User B cannot add stop to User A's trip
  res = await post(`${BASE}/trips/${tripA.id}/stops`, {
    city_id: city1.id,
  }, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B add stop → 404 (got ${res.status})`);

  // 8b. User B cannot update User A's stop
  res = await patch(
    `${BASE}/trips/${tripA.id}/stops/${stop1.id}`,
    { notes: 'Hacked!' },
    tokenB,
  );
  body = await res.json();
  assert(res.status === 404, `User B update stop → 404 (got ${res.status})`);

  // 8c. User B cannot delete User A's stop
  res = await del(`${BASE}/trips/${tripA.id}/stops/${stop1.id}`, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B delete stop → 404 (got ${res.status})`);

  // 8d. User B cannot list User A's private trip stops
  res = await get(`${BASE}/trips/${tripA.id}/stops`, tokenB);
  body = await res.json();
  assert(res.status === 404, `User B list stops → 404 (got ${res.status})`);

  // ═════════════════════════════════════════════════════
  // 9. DELETE & RE-COMPACT
  // ═════════════════════════════════════════════════════
  console.log('\n── 9. Delete & Re-compact ─────────────────────');

  // Delete the middle stop
  const midStopId = reordered[1].id;
  res = await del(`${BASE}/trips/${tripA.id}/stops/${midStopId}`, tokenA);
  body = await res.json();
  assert(res.status === 200, `Delete middle stop → 200 (got ${res.status})`);

  // Verify re-compaction
  res = await get(`${BASE}/trips/${tripA.id}/stops`, tokenA);
  body = await res.json();
  const afterDelete = body.data.stops;
  assert(afterDelete.length === 2, `2 stops remain (got ${afterDelete.length})`);
  const newOrders = afterDelete.map((s) => s.stop_order);
  assert(
    JSON.stringify(newOrders) === JSON.stringify([1, 2]),
    `Orders re-compacted to [1,2] (got [${newOrders}])`,
  );

  // ═════════════════════════════════════════════════════
  // CLEANUP & SUMMARY
  // ═════════════════════════════════════════════════════

  // Delete test trips (cleans up stops via cascade)
  await del(`${BASE}/trips/${tripA.id}`, tokenA);
  await del(`${BASE}/trips/${tripNoDates.id}`, tokenA);

  // Delete test users
  await del(`${BASE}/users/me`, tokenA);
  await del(`${BASE}/users/me`, tokenB);

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('\n✗ Test runner crashed:', err);
  process.exit(1);
});
