import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripsService } from '../services/trips';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatDateEditorial, formatTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { formatErrorMessage } from '../utils/formatError';
import { ACTIVITY_TYPES } from '../utils/constants';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowDown,
  DollarSign,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';

export default function Timeline() {
  const { id: tripId } = useParams();
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Screen 9 Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('time_asc');

  useEffect(() => {
    loadTimeline();
  }, [tripId]);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsService.getTimeline(tripId);
      setTimelineData(res.data || null);
    } catch (err) {
      setError(formatErrorMessage(err, 'Failed to load itinerary view.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={8} />
      </div>
    );
  }

  if (error || !timelineData) {
    return (
      <div className="page page-content">
        <ErrorState message={error || 'Timeline unavailable.'} onRetry={loadTimeline} />
      </div>
    );
  }

  const { trip, timeline = [], stops = [], summary } = timelineData;

  return (
    <div className="page page-content max-w-4xl mx-auto space-y-8">
      {/* Top Header & Back Button */}
      <div>
        <Link
          to={`/trips/${tripId}`}
          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-semibold mb-3 no-underline"
        >
          <ArrowLeft size={14} /> Back to Itinerary Builder
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-gray-lighter pb-3">
          <div>
            <span className="text-label text-[10px] block mb-1">
              ITENARY VIEW SCREENN WITH BUDGET SECTION (SCREEN 9)
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-ink">
              Itenary for : <span className="text-terracotta">{trip.name}</span>
            </h1>
          </div>
          <div className="font-mono text-xs font-bold text-ink">
            Total Budget: {formatCurrency(trip.total_budget || 0, trip.currency)}
          </div>
        </div>
      </div>

      {/* ── Screen 9: Search bar + Group by + Filter + Sort by Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ..... (search activities or notes)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1">
            <Layers size={14} className="text-ink-subtle" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="day">Group by: Day</option>
              <option value="destination">Group by: Destination</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="culture">Culture</option>
              <option value="food">Food</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-ink-subtle" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="time_asc">Sort by: Time</option>
              <option value="cost_desc">Sort by: Expense (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 9: Two-Column Parallel Timeline (Physical Activity vs Expense) ── */}
      {timeline.length > 0 ? (
        <div className="space-y-8">
          {timeline.map((day, dayIdx) => {
            const rawActivities = day.activities || [];
            const activities = rawActivities.filter((a) =>
              !searchQuery ||
              a.activity?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.notes?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div key={day.date} className="surface p-6 space-y-4 shadow-sm">
                {/* Day Badge & Destination Header */}
                <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-ink text-paper rounded-xs font-mono text-xs font-bold">
                      Day {day.day_number || dayIdx + 1}
                    </span>
                    <span className="font-display text-lg text-ink">
                      {formatDateEditorial(day.date)}
                    </span>
                    {day.city && (
                      <span className="travel-stamp text-[9px] py-0">{day.city.name}</span>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold text-ink">
                    Day Total: {formatCurrency(day.daily_cost || 0, trip.currency)}
                  </span>
                </div>

                {/* Table Header: Physical Activity vs Expense */}
                <div className="grid grid-cols-12 gap-4 text-label text-[10px] text-ink-subtle font-mono border-b border-warm-gray-lighter pb-2">
                  <div className="col-span-8 md:col-span-9 font-bold">Physical Activity</div>
                  <div className="col-span-4 md:col-span-3 text-right font-bold">Expense</div>
                </div>

                {/* Parallel Row List with Down Arrows */}
                {activities.length === 0 ? (
                  <p className="text-xs text-ink-subtle italic py-2">
                    No scheduled activities for this day. Free exploration.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((act, actIdx) => {
                      const typeConfig = ACTIVITY_TYPES[act.activity?.type] || ACTIVITY_TYPES.other;
                      const startTime = act.start_time ? formatTime(act.start_time) : 'FLEX';
                      const cost = act.estimated_cost || act.activity?.cost || 0;

                      return (
                        <div key={act.id} className="space-y-2">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Left Column: Physical Activity Box */}
                            <div className="col-span-8 md:col-span-9 p-3 bg-paper-warm border border-warm-gray-lighter rounded-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-terracotta">
                                  {startTime}
                                </span>
                                <h4 className="font-display text-base text-ink leading-tight">
                                  {act.activity?.name}
                                </h4>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs badge--${typeConfig.color}`}>
                                  {typeConfig.label}
                                </span>
                              </div>
                              {act.notes && (
                                <p className="text-xs text-ink-muted italic font-light">
                                  "{act.notes}"
                                </p>
                              )}
                            </div>

                            {/* Right Column: Expense Box */}
                            <div className="col-span-4 md:col-span-3 p-3 bg-white border border-warm-gray-lighter rounded-sm flex flex-col justify-center items-end">
                              <span className="text-[9px] text-ink-subtle font-mono uppercase">EST. COST</span>
                              <span className="font-mono text-sm font-bold text-ink">
                                {formatCurrency(cost, trip.currency)}
                              </span>
                            </div>
                          </div>

                          {/* Down Arrow connector if not last activity */}
                          {actIdx < activities.length - 1 && (
                            <div className="flex items-center pl-8 text-warm-gray">
                              <ArrowDown size={16} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : stops.length > 0 ? (
        /* Fallback for stops */
        <div className="space-y-6">
          {stops.map((stop, idx) => (
            <div key={stop.stop_id} className="surface p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
                <span className="font-mono text-xs font-bold">Stop {idx + 1}: {stop.city?.name}</span>
                <span className="font-mono text-xs">{formatCurrency(stop.stop_cost || 0, trip.currency)}</span>
              </div>
              {stop.activities?.map((act) => (
                <div key={act.id} className="grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-9 p-2 bg-paper-warm rounded">{act.activity?.name}</div>
                  <div className="col-span-3 p-2 bg-white rounded text-right font-mono font-bold">
                    {formatCurrency(act.estimated_cost || 0, trip.currency)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="surface p-12 text-center text-ink-subtle italic">
          No activities added yet. Return to the Itinerary Builder to add destinations and activities.
        </div>
      )}
    </div>
  );
}
