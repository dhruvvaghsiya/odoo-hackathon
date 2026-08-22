const budgetService = require('../services/budget.service');
const { success, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (v) => UUID_RE.test(v);

// ── GET /api/trips/:tripId/budget/analysis ─────────────

const getBudgetAnalysis = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    if (!isValidUUID(tripId)) {
      return fail(res, { statusCode: 400, message: 'Invalid trip ID format.' });
    }

    const analysis = await budgetService.getAnalysis(tripId, req.user.id);

    return success(res, {
      message: 'Budget analysis retrieved successfully.',
      data: { analysis },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBudgetAnalysis,
};
