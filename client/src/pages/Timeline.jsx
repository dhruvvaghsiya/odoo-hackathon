import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tripsService } from '../services/trips';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatDateEditorial, formatTime } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { ACTIVITY_TYPES } from '../utils/constants';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Timeline() {
  const { id: tripId } = useParams();
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    loadTimeline();
  }, [tripId]);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsService.getTimeline(tripId);
      setTimelineData(res.data || null);

      // Auto-expand all days by default
      const days = res.data?.timeline || [];
      const initExpanded = {};
      days.forEach((_, idx) => {
        initExpanded[idx] = true;
      });
      setExpandedDays(initExpanded);
    } catch (err) {
      setError(err.message || 'Failed to load timeline.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (idx) => {
    setExpandedDays((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
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

  const { trip, timeline, stops, unscheduled, summary } = timelineData;

  return (
    <div className="page page-content max-w-4xl mx-auto space-y-8">
      {/* Header & Back Link */}
      <div>
        <Link
          to={`/trips/${tripId}`}
          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-semibold mb-4 no-underline"
        >
          <ArrowLeft size={14} /> Back to Journey Canvas
        </Link>

        <PageHeader
          stamp="CHRONOLOGICAL FLOW"
          coordinates={`${summary?.total_days || 'FLEXIBLE'} DAYS • ${summary?.total_activities || 0} EXPERIENCES`}
          title={`Timeline: ${trip.name}`}
          subtitle="A structured time-sequence of your planned experiences, daily destinations, and activity costs."
        />
      </div>

      {/* Summary Bar */}
      <div className="surface p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div>
          <span className="text-ink-subtle block text-[10px]">TOTAL ESTIMATED ACTIVITIES COST</span>
          <span className="text-base font-bold text-ink">
            {formatCurrency(summary?.total_estimated_cost || 0, trip.currency)}
          </span>
        </div>
        <div>
          <span className="text-ink-subtle block text-[10px]">TOTAL SCHEDULED EXPERIENCES</span>
          <span className="text-base font-bold text-ink">{summary?.total_activities || 0}</span>
        </div>
        <div>
          <span className="text-ink-subtle block text-[10px]">CITIES VISITED</span>
          <span className="text-base font-bold text-ink">{summary?.number_of_cities || 0}</span>
        </div>
      </div>

      {/* Timeline Days Flow (If dated timeline exists) */}
      {timeline && timeline.length > 0 ? (
        <div className="space-y-8">
          {timeline.map((day, dayIndex) => {
            const isExpanded = !!expandedDays[dayIndex];
            const activities = day.activities || [];

            return (
              <div key={day.date} className="surface overflow-hidden">
                {/* Day Header */}
                <div
                  onClick={() => toggleDay(dayIndex)}
                  className="p-4 bg-paper-warm/80 border-b border-warm-gray-lighter flex items-center justify-between cursor-pointer hover:bg-paper-warm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-ink text-paper font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {String(day.day_number).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg text-ink">
                          {formatDateEditorial(day.date)}
                        </span>
                        {day.city && (
                          <span className="travel-stamp travel-stamp--olive text-[9px] py-0">
                            {day.city.name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-subtle font-mono">
                        {activities.length} activity{activities.length === 1 ? '' : 'ies'} scheduled
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-ink">
                      {formatCurrency(day.daily_cost, trip.currency)}
                    </span>
                    <button className="btn-icon !w-7 !h-7">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Day Activities Sequence with Time Typography */}
                {isExpanded && (
                  <div className="p-6">
                    {activities.length === 0 ? (
                      <p className="text-xs text-ink-subtle italic py-2">
                        Free day for open exploration or transit.
                      </p>
                    ) : (
                      <div className="space-y-0 relative pl-4 md:pl-8">
                        {activities.map((act, actIndex) => {
                          const typeConfig = ACTIVITY_TYPES[act.activity?.type] || ACTIVITY_TYPES.other;
                          const startTime = act.start_time ? formatTime(act.start_time) : 'FLEX';
                          const isLast = actIndex === activities.length - 1;

                          return (
                            <div key={act.id} className="relative flex gap-4 md:gap-6 group">
                              {/* Left Line & Marker */}
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-terracotta my-1.5 shrink-0" />
                                {!isLast && <div className="w-0.5 flex-1 bg-warm-gray-lighter min-h-[36px]" />}
                              </div>

                              {/* Content */}
                              <div className="flex-1 pb-6 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-ink-subtle">
                                      {startTime}
                                    </span>
                                    <h4 className="font-display text-base text-ink">
                                      {act.activity?.name}
                                    </h4>
                                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs badge--${typeConfig.color}`}>
                                      {typeConfig.label}
                                    </span>
                                  </div>

                                  <span className="font-mono text-xs font-semibold text-ink sm:self-auto">
                                    {formatCurrency(act.estimated_cost || act.activity?.cost || 0, trip.currency)}
                                  </span>
                                </div>

                                {act.activity?.description && (
                                  <p className="text-xs text-ink-muted mt-1 font-light line-clamp-2">
                                    {act.activity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : stops && stops.length > 0 ? (
        /* Flat Stops Timeline for trips without date bounds */
        <div className="space-y-6">
          {stops.map((stop, idx) => (
            <div key={stop.stop_id} className="surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-terracotta text-sm">
                    STOP {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl text-ink">{stop.city?.name}, {stop.city?.country}</h3>
                </div>
                <span className="font-mono text-xs font-semibold text-ink">
                  {formatCurrency(stop.stop_cost, trip.currency)}
                </span>
              </div>

              <div className="space-y-2">
                {stop.activities?.map((act) => (
                  <div key={act.id} className="flex items-center justify-between text-xs py-1">
                    <span>{act.activity?.name}</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(act.estimated_cost || 0, trip.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center text-ink-subtle">
          No activities planned yet. Return to the Journey Canvas to add destinations.
        </div>
      )}
    </div>
  );
}
