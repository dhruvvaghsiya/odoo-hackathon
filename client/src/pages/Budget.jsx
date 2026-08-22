import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { budgetService } from '../services/budget';
import { expensesService } from '../services/expenses';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import BudgetBar from '../components/BudgetBar';
import ExpenseForm from '../components/ExpenseForm';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';

const CATEGORY_COLORS = {
  TRANSPORT: '#C4654A', // Terracotta
  STAY: '#1B2432',      // Ink
  ACTIVITY: '#5B7553',  // Olive
  MEAL: '#C4954A',      // Warm Amber
  OTHER: '#A0998E',     // Warm Gray
};

export default function Budget() {
  const { id: tripId } = useParams();
  const toast = useToast();

  const [analysis, setAnalysis] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    loadBudgetData();
  }, [tripId]);

  const loadBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysisRes, expensesRes] = await Promise.all([
        budgetService.getAnalysis(tripId),
        expensesService.list(tripId, { limit: 100 }),
      ]);
      setAnalysis(analysisRes.data?.analysis || null);
      setExpenses(expensesRes.data?.expenses || []);
    } catch (err) {
      setError(err.message || 'Failed to load budget analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await expensesService.update(tripId, editingExpense.id, expenseData);
        toast.success('Expense updated.');
      } else {
        await expensesService.create(tripId, expenseData);
        toast.success('Expense recorded.');
      }
      loadBudgetData();
    } catch (err) {
      toast.error(err.message || 'Failed to save expense.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      await expensesService.delete(tripId, expenseId);
      toast.success('Expense deleted.');
      loadBudgetData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense.');
    }
  };

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={8} />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="page page-content">
        <ErrorState message={error || 'Budget journal unavailable.'} onRetry={loadBudgetData} />
      </div>
    );
  }

  const { overview, highlights, spending_by_category, spending_by_day, recommendations, currency } = analysis;

  const categoryChartData = (spending_by_category || []).map((cat) => ({
    name: cat.category,
    value: parseFloat(cat.total),
    percentage: cat.percentage,
  }));

  const dailyChartData = (spending_by_day || []).map((day) => ({
    date: formatDateShort(day.date),
    total: parseFloat(day.total),
  }));

  return (
    <div className="page page-wide space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/trips/${tripId}`}
          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-semibold mb-4 no-underline"
        >
          <ArrowLeft size={14} /> Back to Journey Canvas
        </Link>

        <PageHeader
          stamp="FINANCIAL LOG / AUDIT"
          coordinates={`CURRENCY: ${currency} • ${overview.expense_count || 0} LOGGED EXPENSES`}
          title={`Budget Journal: ${analysis.trip_name}`}
          subtitle="Real-time expense tracking, category breakdowns, daily rate projections, and proactive warnings."
          action={
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="btn btn-terracotta"
            >
              <Plus size={16} /> Log Expense
            </button>
          }
        />
      </div>

      {/* Main Budget Progress Card */}
      <BudgetBar
        totalBudget={overview.total_budget}
        totalSpent={overview.total_spent}
        currency={currency}
      />

      {/* Key Financial Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface p-4">
          <span className="text-label text-[10px] block mb-1">DAILY SPENDING RATE</span>
          <div className="font-display text-2xl text-ink">
            {formatCurrency(highlights.average_daily_spending || 0, currency)}
          </div>
          <span className="text-[11px] text-ink-subtle">Average across active days</span>
        </div>

        <div className="surface p-4">
          <span className="text-label text-[10px] block mb-1">PROJECTED EXPEDITION COST</span>
          <div className="font-display text-2xl text-ink">
            {highlights.projected_total_cost
              ? formatCurrency(highlights.projected_total_cost, currency)
              : 'Calculating...'}
          </div>
          <span className="text-[11px] text-ink-subtle">Based on current velocity</span>
        </div>

        <div className="surface p-4">
          <span className="text-label text-[10px] block mb-1">PRIMARY COST DRIVER</span>
          <div className="font-display text-2xl text-ink">
            {highlights.highest_spending_category?.category || 'None'}
          </div>
          <span className="text-[11px] text-ink-subtle">
            {highlights.highest_spending_category
              ? formatCurrency(highlights.highest_spending_category.total, currency)
              : '—'}
          </span>
        </div>

        <div className="surface p-4">
          <span className="text-label text-[10px] block mb-1">PEAK SPENDING DATE</span>
          <div className="font-display text-2xl text-ink">
            {highlights.highest_spending_day
              ? formatDateShort(highlights.highest_spending_day.date)
              : '—'}
          </div>
          <span className="text-[11px] text-ink-subtle">
            {highlights.highest_spending_day
              ? formatCurrency(highlights.highest_spending_day.total, currency)
              : '—'}
          </span>
        </div>
      </div>

      {/* Editorial Recommendations / Alerts */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3">
          <SectionLabel label="INTELLIGENT BUDGET RECOMMENDATIONS" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-sm border ${
                  rec.type === 'critical'
                    ? 'bg-danger-muted/30 border-danger text-danger'
                    : rec.type === 'warning'
                    ? 'bg-warning-muted/30 border-warning text-warning'
                    : 'bg-paper-warm border-warm-gray-lighter text-ink'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {rec.type === 'critical' ? (
                    <AlertTriangle size={16} className="shrink-0" />
                  ) : (
                    <Sparkles size={16} className="text-terracotta shrink-0" />
                  )}
                  <h4 className="font-display text-base font-bold">{rec.title}</h4>
                </div>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="surface p-6">
          <SectionLabel label="SPENDING BY CATEGORY" />
          {categoryChartData.length > 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || '#1B2432'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val, currency)}
                    contentStyle={{
                      backgroundColor: '#FAF7F2',
                      borderColor: '#C4BDB0',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap justify-center gap-3 text-xs font-mono mt-2">
                {categoryChartData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#1B2432' }}
                    />
                    <span>{cat.name} ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-subtle text-center py-12">No categorized expenses yet.</p>
          )}
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="surface p-6">
          <SectionLabel label="DAILY EXPENSE FLOW" />
          {dailyChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <XAxis dataKey="date" stroke="#718096" fontSize={10} />
                  <YAxis stroke="#718096" fontSize={10} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val, currency)}
                    contentStyle={{
                      backgroundColor: '#FAF7F2',
                      borderColor: '#C4BDB0',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#C4654A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-ink-subtle text-center py-12">No daily records logged yet.</p>
          )}
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="surface p-6">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel label="JOURNEY EXPENSE LEDGER" count={expenses.length} className="!mb-0" />
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-ink-subtle text-xs">
            <Receipt size={32} className="mx-auto mb-2 opacity-40 text-terracotta" />
            <p>Your ledger is clear. Log expenses to monitor spending in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-warm-gray-lighter text-label text-[10px]">
                  <th className="pb-2">CATEGORY</th>
                  <th className="pb-2">DESCRIPTION</th>
                  <th className="pb-2">DATE</th>
                  <th className="pb-2 text-right">AMOUNT</th>
                  <th className="pb-2 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-gray-lighter">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-paper-warm/50 transition-colors">
                    <td className="py-3 font-mono">
                      <span className="travel-stamp text-[9px] py-0">{exp.category}</span>
                    </td>
                    <td className="py-3 font-light text-ink">
                      {exp.description || 'General expense'}
                    </td>
                    <td className="py-3 font-mono text-ink-subtle">
                      {exp.expense_date ? formatDateShort(exp.expense_date) : '—'}
                    </td>
                    <td className="py-3 font-mono font-bold text-ink text-right">
                      {formatCurrency(exp.amount, exp.currency || currency)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          className="btn-icon !w-7 !h-7"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="btn-icon !w-7 !h-7 text-ink-subtle hover:text-danger"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleCreateOrUpdateExpense}
        initialData={editingExpense}
        tripCurrency={currency}
      />
    </div>
  );
}
