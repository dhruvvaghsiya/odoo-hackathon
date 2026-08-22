import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripsService } from '../services/trips';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { CURRENCIES } from '../utils/constants';
import { MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';

export default function CreateTrip() {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination') || '';

  const [name, setName] = useState(
    initialDestination ? `Journey to ${initialDestination}` : 'European Summer'
  );
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('3500');
  const [currency, setCurrency] = useState('USD');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Trip name is required.');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to end date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await tripsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        total_budget: totalBudget ? parseFloat(totalBudget) : undefined,
        currency,
        is_public: isPublic,
      });

      const newTrip = res.data?.trip;
      toast.success(`Journey "${newTrip?.name || name}" initiated.`);
      navigate(`/trips/${newTrip?.id || ''}`);
    } catch (err) {
      setError(err.message || 'Failed to create journey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-content max-w-3xl mx-auto space-y-8">
      <PageHeader
        stamp="INITIALIZATION"
        coordinates="CREATE / PLOT NEW JOURNEY"
        title="Design a New Expedition"
        subtitle="Establish the foundational parameters for your Journey Canvas. You will plot multi-city stops and experiences in the next step."
      />

      <div className="surface p-6 md:p-8">
        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Name */}
          <div className="input-group">
            <label className="input-label">Journey Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mediterranean Coast Odyssey"
              className="input-field text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Travel Notes / Overview</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of your travel ambitions, route inspiration, or style..."
              className="input-field text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Departure Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Return Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="input-group sm:col-span-2">
              <label className="input-label">Target Budget</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="e.g. 5000"
                  className="input-field font-mono"
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field font-mono text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="p-4 bg-paper-warm rounded-sm flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-ink block">Public Itinerary</span>
              <span className="text-xs text-ink-subtle">
                Allow generating a read-only shareable digital magazine link for fellow explorers.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 accent-terracotta cursor-pointer"
            />
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-warm-gray-lighter flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-terracotta !py-3 !px-6"
            >
              {loading ? 'Initializing Canvas...' : (
                <>
                  Initialize Journey Canvas <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
