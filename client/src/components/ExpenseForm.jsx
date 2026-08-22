import { useState } from 'react';
import Modal from './Modal';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../utils/constants';

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  tripCurrency = 'USD',
}) {
  const [category, setCategory] = useState(initialData?.category || 'TRANSPORT');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [currency, setCurrency] = useState(initialData?.currency || tripCurrency);
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expense_date ? initialData.expense_date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
      setError('Please enter a valid expense amount.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        category,
        amount: parseFloat(amount),
        currency,
        expense_date: expenseDate || undefined,
        description: description || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Journey Expense' : 'Log Journey Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-muted text-danger text-xs p-2.5 rounded-sm">
            {error}
          </div>
        )}

        {/* Category */}
        <div className="input-group">
          <label className="input-label">Expense Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="input-group col-span-2">
            <label className="input-label">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field font-mono"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-field font-mono text-xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="input-group">
          <label className="input-label">Date Incurred</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label">Description / Note</label>
          <input
            type="text"
            placeholder="e.g. Train from Paris to Zurich"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-warm-gray-lighter">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-terracotta">
            {loading ? 'Recording...' : initialData ? 'Update Expense' : 'Log Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
