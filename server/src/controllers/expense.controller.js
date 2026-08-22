const expenseService = require('../services/expense.service');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (v) => UUID_RE.test(v);
const isValidDate = (v) => !isNaN(Date.parse(v));

// ── POST /api/trips/:tripId/expenses ───────────────────

const createExpense = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    if (!isValidUUID(tripId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID format.' });
    }

    const { category, amount, currency, expense_date, description } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (!category || typeof category !== 'string') {
      errors.push(
        `category is required. Must be one of: ${expenseService.VALID_CATEGORIES.join(', ')}.`,
      );
    }

    if (amount === undefined || amount === null) {
      errors.push('amount is required.');
    } else if (typeof amount !== 'number' || amount < 0) {
      errors.push('amount must be a non-negative number.');
    }

    if (currency !== undefined && currency !== null) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        errors.push('currency must be a 3-letter ISO code (e.g. USD, EUR).');
      }
    }

    if (expense_date !== undefined && expense_date !== null && !isValidDate(expense_date)) {
      errors.push('expense_date must be a valid date (YYYY-MM-DD).');
    }

    if (errors.length > 0) {
      return fail(res, { statusCode: 400, message: 'Validation failed.', error: errors });
    }

    const expense = await expenseService.create(tripId, req.user.id, {
      category,
      amount,
      currency,
      expense_date,
      description,
    });

    return created(res, {
      message: 'Expense added successfully.',
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/expenses ────────────────────

const listExpenses = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    if (!isValidUUID(tripId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID format.' });
    }

    const { category, sort, order, page, limit } = req.query;

    const result = await expenseService.findAllByTrip(tripId, req.user.id, {
      category,
      sort,
      order,
      page,
      limit,
    });

    return success(res, {
      message: 'Expenses retrieved successfully.',
      data: {
        expenses: result.expenses,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/trips/:tripId/expenses/:expenseId ───────

const updateExpense = async (req, res, next) => {
  try {
    const { tripId, expenseId } = req.params;
    if (!isValidUUID(tripId) || !isValidUUID(expenseId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID or expense ID format.' });
    }

    const { category, amount, currency, expense_date, description } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];

    if (amount !== undefined && amount !== null) {
      if (typeof amount !== 'number' || amount < 0) {
        errors.push('amount must be a non-negative number.');
      }
    }

    if (currency !== undefined && currency !== null) {
      if (typeof currency !== 'string' || currency.length !== 3) {
        errors.push('currency must be a 3-letter ISO code.');
      }
    }

    if (expense_date !== undefined && expense_date !== null && !isValidDate(expense_date)) {
      errors.push('expense_date must be a valid date (YYYY-MM-DD).');
    }

    if (errors.length > 0) {
      return fail(res, { statusCode: 400, message: 'Validation failed.', error: errors });
    }

    const expense = await expenseService.update(expenseId, tripId, req.user.id, {
      category,
      amount,
      currency,
      expense_date,
      description,
    });

    return success(res, {
      message: 'Expense updated successfully.',
      data: { expense },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/trips/:tripId/expenses/:expenseId ──────

const deleteExpense = async (req, res, next) => {
  try {
    const { tripId, expenseId } = req.params;
    if (!isValidUUID(tripId) || !isValidUUID(expenseId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID or expense ID format.' });
    }

    const deleted = await expenseService.remove(expenseId, tripId, req.user.id);

    if (!deleted) {
      return fail(res, { statusCode: 404, message: 'Expense not found.' });
    }

    return success(res, { message: 'Expense deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/trips/:tripId/budget ──────────────────────

const getBudget = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    if (!isValidUUID(tripId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID format.' });
    }

    const summary = await expenseService.getBudgetSummary(tripId, req.user.id);

    return success(res, {
      message: 'Budget summary retrieved successfully.',
      data: { budget: summary },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
  getBudget,
};
