const db = require('../config/db');

// ── Helpers ────────────────────────────────────────────

/**
 * Verify trip exists and is owned by user.
 * @returns {Promise<object|null>} trip row or null
 */
const verifyTripOwnership = async (tripId, userId) => {
  const { rows } = await db.query(
    `SELECT id, user_id, name, start_date, end_date, total_budget, currency
     FROM trips WHERE id = $1`,
    [tripId],
  );
  const trip = rows[0];
  if (!trip || trip.user_id !== userId) return null;
  return trip;
};

/**
 * Calculate number of days in a trip (inclusive).
 */
const calcTripDays = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
};

/**
 * Round a number to 2 decimal places.
 */
const round2 = (n) => Math.round(n * 100) / 100;

// ── BUDGET ANALYSIS ────────────────────────────────────

/**
 * Full budget analysis for a trip.
 *
 * Returns:
 * - overview (total budget, spent, remaining, % used)
 * - spending by category
 * - spending by day
 * - highest spending category & day
 * - average daily spending
 * - projected total cost
 * - over-budget days
 * - deterministic recommendations
 *
 * @param {string} tripId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getAnalysis = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);
  if (!trip) {
    const err = new Error('Trip not found.');
    err.statusCode = 404;
    throw err;
  }

  const totalBudget = trip.total_budget ? parseFloat(trip.total_budget) : null;
  const tripDays = calcTripDays(trip.start_date, trip.end_date);

  // ── 1. Aggregate totals ─────────────────────────────
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

  const remaining = totalBudget !== null ? round2(totalBudget - totalSpent) : null;
  const percentageUsed =
    totalBudget !== null && totalBudget > 0
      ? round2((totalSpent / totalBudget) * 100)
      : null;

  // ── 2. Spending by category ─────────────────────────
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

  const spendingByCategory = categoryRows.map((r) => ({
    category: r.category,
    total: parseFloat(r.total),
    count: r.count,
    percentage: totalSpent > 0 ? round2((parseFloat(r.total) / totalSpent) * 100) : 0,
  }));

  // Highest spending category
  const highestCategory =
    spendingByCategory.length > 0
      ? { category: spendingByCategory[0].category, total: spendingByCategory[0].total }
      : null;

  // ── 3. Spending by day ──────────────────────────────
  const { rows: dailyRows } = await db.query(
    `SELECT
       expense_date::text                        AS date,
       COALESCE(SUM(amount), 0)::numeric(12,2) AS total,
       COUNT(*)::int                             AS count
     FROM expenses
     WHERE trip_id = $1 AND expense_date IS NOT NULL
     GROUP BY expense_date
     ORDER BY expense_date ASC`,
    [tripId],
  );

  const spendingByDay = dailyRows.map((r) => ({
    date: r.date,
    total: parseFloat(r.total),
    count: r.count,
  }));

  // Highest spending day
  let highestDay = null;
  if (spendingByDay.length > 0) {
    const max = spendingByDay.reduce(
      (best, d) => (d.total > best.total ? d : best),
      spendingByDay[0],
    );
    highestDay = { date: max.date, total: max.total };
  }

  // ── 4. Average daily spending ───────────────────────
  // Based on actual days with expenses (not trip length)
  const daysWithExpenses = spendingByDay.length;
  const averageDailySpending =
    daysWithExpenses > 0 ? round2(totalSpent / daysWithExpenses) : 0;

  // Also calc based on total trip days
  const averageDailyBudget =
    totalBudget !== null && tripDays !== null ? round2(totalBudget / tripDays) : null;

  const averageDailySpendingByTripLength =
    tripDays !== null && tripDays > 0 ? round2(totalSpent / tripDays) : null;

  // ── 5. Projected total cost ─────────────────────────
  // Linear projection: (total spent so far / days elapsed) * total trip days
  let projectedTotalCost = null;
  let daysElapsed = null;

  if (trip.start_date && tripDays !== null) {
    const tripStart = new Date(trip.start_date);
    const now = new Date();
    const tripEnd = new Date(trip.end_date);

    // Use the latest expense date or today, whichever is more meaningful
    const latestExpenseDate = spendingByDay.length > 0
      ? new Date(spendingByDay[spendingByDay.length - 1].date)
      : null;

    const referenceDate = latestExpenseDate
      ? new Date(Math.min(latestExpenseDate, tripEnd, now))
      : new Date(Math.min(now, tripEnd));

    daysElapsed = Math.max(
      1,
      Math.ceil((referenceDate - tripStart) / (1000 * 60 * 60 * 24)) + 1,
    );

    if (daysElapsed > 0 && totalSpent > 0) {
      const dailyRate = totalSpent / daysElapsed;
      projectedTotalCost = round2(dailyRate * tripDays);
    }
  }

  // ── 6. Over-budget days ─────────────────────────────
  // Days where daily spending exceeds the average daily budget
  let overBudgetDays = [];
  if (averageDailyBudget !== null && averageDailyBudget > 0) {
    overBudgetDays = spendingByDay
      .filter((d) => d.total > averageDailyBudget)
      .map((d) => ({
        date: d.date,
        spent: d.total,
        daily_budget: averageDailyBudget,
        overage: round2(d.total - averageDailyBudget),
      }));
  }

  // ── 7. Deterministic recommendations ────────────────
  const recommendations = buildRecommendations({
    totalBudget,
    totalSpent,
    remaining,
    percentageUsed,
    projectedTotalCost,
    averageDailyBudget,
    averageDailySpending,
    highestCategory,
    overBudgetDays,
    tripDays,
    daysElapsed,
    daysWithExpenses,
    currency: trip.currency,
  });

  return {
    trip_id: tripId,
    trip_name: trip.name,
    currency: trip.currency,

    overview: {
      total_budget: totalBudget,
      total_spent: totalSpent,
      remaining,
      percentage_used: percentageUsed,
      expense_count: expenseCount,
    },

    timing: {
      trip_days: tripDays,
      days_elapsed: daysElapsed,
      days_with_expenses: daysWithExpenses,
    },

    spending_by_category: spendingByCategory,
    spending_by_day: spendingByDay,

    highlights: {
      highest_spending_category: highestCategory,
      highest_spending_day: highestDay,
      average_daily_spending: averageDailySpending,
      average_daily_spending_by_trip_length: averageDailySpendingByTripLength,
      average_daily_budget: averageDailyBudget,
      projected_total_cost: projectedTotalCost,
    },

    over_budget_days: overBudgetDays,
    recommendations,
  };
};

// ── Recommendation engine ──────────────────────────────

/**
 * Build an array of deterministic, actionable recommendations
 * based purely on the numbers. No external AI APIs.
 */
const buildRecommendations = ({
  totalBudget,
  totalSpent,
  remaining,
  percentageUsed,
  projectedTotalCost,
  averageDailyBudget,
  averageDailySpending,
  highestCategory,
  overBudgetDays,
  tripDays,
  daysElapsed,
  daysWithExpenses,
  currency,
}) => {
  const recs = [];

  // 1. Projected over-budget warning
  if (totalBudget !== null && projectedTotalCost !== null && projectedTotalCost > totalBudget) {
    const overage = round2(projectedTotalCost - totalBudget);
    const pctOver = round2((overage / totalBudget) * 100);
    recs.push({
      type: 'warning',
      code: 'PROJECTED_OVER_BUDGET',
      title: 'Projected trip cost exceeds budget',
      message:
        `At the current spending rate, this trip is projected to cost ${currency} ${projectedTotalCost.toLocaleString()} — ` +
        `${currency} ${overage.toLocaleString()} (${pctOver}%) over the ${currency} ${totalBudget.toLocaleString()} budget. ` +
        `Consider reducing daily spending to stay on track.`,
    });
  }

  // 2. Already over budget
  if (totalBudget !== null && totalSpent > totalBudget) {
    const overage = round2(totalSpent - totalBudget);
    recs.push({
      type: 'critical',
      code: 'OVER_BUDGET',
      title: 'Budget exceeded',
      message:
        `Total spending of ${currency} ${totalSpent.toLocaleString()} has exceeded the ` +
        `${currency} ${totalBudget.toLocaleString()} budget by ${currency} ${overage.toLocaleString()}.`,
    });
  }

  // 3. Remaining daily budget
  if (totalBudget !== null && remaining !== null && tripDays !== null && daysElapsed !== null) {
    const daysRemaining = tripDays - daysElapsed;
    if (daysRemaining > 0 && remaining > 0) {
      const remainingDailyBudget = round2(remaining / daysRemaining);
      recs.push({
        type: 'info',
        code: 'REMAINING_DAILY_BUDGET',
        title: 'Remaining daily budget',
        message:
          `With ${daysRemaining} day(s) remaining and ${currency} ${remaining.toLocaleString()} left, ` +
          `the daily budget for the rest of the trip is ${currency} ${remainingDailyBudget.toLocaleString()} per day.`,
      });
    } else if (daysRemaining > 0 && remaining <= 0) {
      recs.push({
        type: 'critical',
        code: 'NO_REMAINING_BUDGET',
        title: 'No remaining budget',
        message:
          `There are ${daysRemaining} day(s) remaining but no budget left. ` +
          `All further spending will exceed the trip budget.`,
      });
    }
  }

  // 4. Category consuming most budget
  if (highestCategory && totalBudget !== null && totalBudget > 0) {
    const catPct = round2((highestCategory.total / totalBudget) * 100);
    if (catPct >= 30) {
      recs.push({
        type: catPct >= 50 ? 'warning' : 'info',
        code: 'HIGH_CATEGORY_SPEND',
        title: `${highestCategory.category} is consuming ${catPct}% of the total budget`,
        message:
          `${currency} ${highestCategory.total.toLocaleString()} has been spent on ${highestCategory.category.toLowerCase()}, ` +
          `which represents ${catPct}% of the ${currency} ${totalBudget.toLocaleString()} budget. ` +
          `${catPct >= 50 ? 'Consider finding ways to reduce spending in this category.' : 'Keep an eye on this category.'}`,
      });
    }
  }

  // 5. Over-budget day warnings
  if (overBudgetDays.length > 0) {
    const count = overBudgetDays.length;
    const worstDay = overBudgetDays.reduce(
      (w, d) => (d.overage > w.overage ? d : w),
      overBudgetDays[0],
    );
    recs.push({
      type: 'warning',
      code: 'OVER_BUDGET_DAYS',
      title: `${count} day(s) exceeded the daily budget`,
      message:
        `${count} day(s) had spending above the average daily budget of ${currency} ${averageDailyBudget.toLocaleString()}. ` +
        `The worst was ${worstDay.date} at ${currency} ${worstDay.spent.toLocaleString()} ` +
        `(${currency} ${worstDay.overage.toLocaleString()} over).`,
    });
  }

  // 6. Spending velocity check
  if (
    percentageUsed !== null &&
    tripDays !== null &&
    daysElapsed !== null &&
    daysElapsed > 0
  ) {
    const timePercentage = round2((daysElapsed / tripDays) * 100);
    if (percentageUsed > timePercentage + 15) {
      recs.push({
        type: 'warning',
        code: 'SPENDING_AHEAD_OF_SCHEDULE',
        title: 'Spending pace is ahead of schedule',
        message:
          `${percentageUsed}% of the budget has been used in ${round2(timePercentage)}% of the trip duration. ` +
          `If this pace continues, the budget will be exhausted before the trip ends.`,
      });
    } else if (percentageUsed < timePercentage - 20 && daysWithExpenses >= 3) {
      recs.push({
        type: 'info',
        code: 'SPENDING_UNDER_PACE',
        title: 'Spending is under pace',
        message:
          `Only ${percentageUsed}% of the budget has been used with ${round2(timePercentage)}% of the trip elapsed. ` +
          `There is room for additional activities or upgrades.`,
      });
    }
  }

  // 7. No budget set
  if (totalBudget === null && daysWithExpenses > 0) {
    recs.push({
      type: 'info',
      code: 'NO_BUDGET_SET',
      title: 'No budget has been set for this trip',
      message:
        `Setting a budget allows GlobeTrotter to provide spending projections, ` +
        `daily limits, and over-budget alerts. Consider adding one to your trip settings.`,
    });
  }

  // 8. No expenses recorded yet
  if (daysWithExpenses === 0) {
    recs.push({
      type: 'info',
      code: 'NO_EXPENSES',
      title: 'No expenses recorded yet',
      message:
        `Start logging expenses to get spending insights, category breakdowns, ` +
        `and budget projections.`,
    });
  }

  return recs;
};

module.exports = {
  getAnalysis,
};
