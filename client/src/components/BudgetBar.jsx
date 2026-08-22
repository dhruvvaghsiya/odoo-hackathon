import { formatCurrency } from '../utils/formatCurrency';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function BudgetBar({
  totalBudget,
  totalSpent,
  currency = 'USD',
  compact = false,
}) {
  if (totalBudget === null || totalBudget === undefined || totalBudget <= 0) {
    return (
      <div className="surface p-4 text-center">
        <p className="text-xs text-ink-subtle">No budget defined for this trip.</p>
        <span className="font-mono text-sm font-semibold text-ink mt-1 block">
          Total Spent: {formatCurrency(totalSpent || 0, currency)}
        </span>
      </div>
    );
  }

  const budget = parseFloat(totalBudget);
  const spent = parseFloat(totalSpent || 0);
  const remaining = budget - spent;
  const percentage = Math.min(100, Math.round((spent / budget) * 100));
  const isOver = spent > budget;
  const isClose = percentage >= 80 && !isOver;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-ink-subtle">{percentage}% Used</span>
          <span className={isOver ? 'text-danger font-semibold' : 'text-ink'}>
            {formatCurrency(spent, currency)} / {formatCurrency(budget, currency)}
          </span>
        </div>
        <div className="w-full h-2 bg-paper-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOver ? 'bg-danger' : isClose ? 'bg-warning' : 'bg-olive'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <span className="text-label text-[10px] block mb-1">JOURNEY BUDGET</span>
          <div className="text-display text-4xl text-ink font-bold">
            {formatCurrency(spent, currency)}
          </div>
          <span className="text-xs text-ink-subtle">
            of {formatCurrency(budget, currency)} total allocation
          </span>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-semibold ${
              isOver
                ? 'bg-danger-muted text-danger'
                : isClose
                ? 'bg-warning-muted text-warning'
                : 'bg-olive-muted text-olive'
            }`}
          >
            {isOver ? (
              <><AlertCircle size={14} /> EXCEEDED BY {formatCurrency(Math.abs(remaining), currency)}</>
            ) : (
              <><CheckCircle size={14} /> {formatCurrency(remaining, currency)} REMAINING</>
            )}
          </div>
          <p className="text-[11px] text-ink-subtle font-mono mt-1">
            {percentage}% of your journey budget used
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3.5 bg-paper-dark rounded-xs overflow-hidden">
        <div
          className={`h-full transition-all duration-700 rounded-xs ${
            isOver ? 'bg-danger' : isClose ? 'bg-warning' : 'bg-olive'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {isOver && (
        <div className="mt-3 flex items-center gap-2 text-xs text-danger font-medium bg-danger-muted/40 p-2.5 rounded-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span>This journey is currently running over budget. Consider reviewing high-cost activities.</span>
        </div>
      )}
    </div>
  );
}
