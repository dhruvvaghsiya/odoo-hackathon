const { Router } = require('express');
const {
  createExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
  getBudget,
} = require('../controllers/expense.controller');

// mergeParams: true to access :tripId from the parent trip router
const router = Router({ mergeParams: true });

// ── Expense CRUD ───────────────────────────────────────
router.post('/', createExpense);
router.get('/', listExpenses);
router.patch('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

// ── Budget summary ─────────────────────────────────────
// Mounted at /api/trips/:tripId/budget via parent router
// but we define it here since it's expense-related.
// The parent router will mount this route group differently.

module.exports = router;
module.exports.getBudget = getBudget;
