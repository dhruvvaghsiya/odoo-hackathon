import { useState } from 'react';
import DestinationMarker from './DestinationMarker';
import { formatDateRange } from '../utils/formatDate';
import { getCityImage } from '../utils/constants';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import ActivityCard from './ActivityCard';

export default function JourneyRoute({
  stops = [],
  trip,
  onOpenCityDiscovery,
  onOpenActivityDiscovery,
  onRemoveStop,
  onReorderStops,
  onRemoveActivity,
}) {
  const [expandedStops, setExpandedStops] = useState({});

  const toggleExpand = (stopId) => {
    setExpandedStops((prev) => ({
      ...prev,
      [stopId]: !prev[stopId],
    }));
  };

  const moveStop = (index, direction) => {
    if (!onReorderStops) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const newOrder = [...stops];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map((s) => s.id);
    onReorderStops(orderedIds);
  };

  if (!stops || stops.length === 0) {
    return (
      <div className="surface p-8 text-center border-dashed border-2 border-warm-gray-lighter">
        <div className="w-14 h-14 mx-auto rounded-full bg-paper-warm flex items-center justify-center mb-3">
          <MapPin size={24} className="text-terracotta" />
        </div>
        <h3 className="font-display text-xl text-ink mb-1">Your Route is Empty</h3>
        <p className="text-xs text-ink-muted max-w-sm mx-auto mb-5 font-light">
          Every great journey begins with a first destination. Add cities to plot your route on the Journey Canvas.
        </p>
        <button onClick={onOpenCityDiscovery} className="btn btn-terracotta">
          <Plus size={16} /> Add First Destination
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Route Header / Origin */}
      <div className="flex items-center gap-4 mb-2">
        <DestinationMarker isStart={true} />
        <div className="flex items-center gap-2">
          <span className="text-label text-[11px]">START JOURNEY</span>
          <span className="coordinates text-[10px]">
            {trip?.start_date ? formatDateRange(trip.start_date, trip.start_date) : 'ORIGIN'}
          </span>
        </div>
      </div>

      {/* Stops Sequence */}
      <div className="space-y-0 relative">
        {stops.map((stop, index) => {
          const isExpanded = !!expandedStops[stop.id];
          const activities = stop.activities || [];
          const stopCityImage = getCityImage(stop.city);
          const isLast = index === stops.length - 1;

          return (
            <div key={stop.id} className="relative flex gap-4 md:gap-6 group">
              {/* Left Column: Marker & Vertical Line */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-terracotta/40" />
                <DestinationMarker order={index + 1} active={isExpanded} />
                <div className="w-0.5 flex-1 bg-warm-gray-lighter group-hover:bg-terracotta/40 transition-colors min-h-[40px]" />
              </div>

              {/* Right Column: Stop Details Card */}
              <div className="flex-1 pb-6 pt-2 min-w-0">
                <div className="surface hover:border-ink transition-all duration-300 overflow-hidden">
                  {/* Top Stop Info Bar */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={stopCityImage}
                        alt={stop.city?.name}
                        className="w-14 h-14 rounded object-cover shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-label text-[10px] text-terracotta font-mono">
                            STOP {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs text-ink-subtle">
                            {stop.city?.country}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl text-ink leading-tight truncate">
                          {stop.city?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-ink-muted font-light">
                          <Calendar size={12} className="text-ink-subtle" />
                          <span>
                            {formatDateRange(stop.start_date, stop.end_date) || 'Dates flexible'}
                          </span>
                          {stop.days && (
                            <span className="font-mono text-[11px]">({stop.days} days)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        onClick={() => moveStop(index, -1)}
                        disabled={index === 0}
                        className="btn-icon !w-7 !h-7 disabled:opacity-20"
                        title="Move Up in Route"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveStop(index, 1)}
                        disabled={index === stops.length - 1}
                        className="btn-icon !w-7 !h-7 disabled:opacity-20"
                        title="Move Down in Route"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Add Activity Trigger */}
                      <button
                        onClick={() => onOpenActivityDiscovery(stop)}
                        className="btn btn-sm btn-secondary text-xs"
                        title="Add Activity to Stop"
                      >
                        <Plus size={13} /> Activity
                      </button>

                      {/* Expand / Collapse Toggle */}
                      <button
                        onClick={() => toggleExpand(stop.id)}
                        className="btn-icon !w-8 !h-8"
                        aria-expanded={isExpanded}
                        title="Toggle Activities"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Remove Stop */}
                      {onRemoveStop && (
                        <button
                          onClick={() => onRemoveStop(stop.id)}
                          className="btn-icon !w-8 !h-8 text-ink-subtle hover:text-danger"
                          title="Remove Stop"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Activities Drawer inside the Stop */}
                  {isExpanded && (
                    <div className="bg-paper-warm/60 border-t border-warm-gray-lighter p-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-label text-[10px]">
                          SCHEDULED ACTIVITIES ({activities.length})
                        </span>
                        <button
                          onClick={() => onOpenActivityDiscovery(stop)}
                          className="text-xs text-terracotta font-semibold hover:underline flex items-center gap-1"
                        >
                          <Plus size={12} /> Explore Activities in {stop.city?.name}
                        </button>
                      </div>

                      {activities.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-warm-gray-lighter rounded-sm bg-white/40">
                          <p className="text-xs text-ink-subtle mb-2">No activities added to this stop yet.</p>
                          <button
                            onClick={() => onOpenActivityDiscovery(stop)}
                            className="btn btn-sm btn-terracotta"
                          >
                            <Sparkles size={13} /> Discover Activities
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activities.map((act) => (
                            <ActivityCard
                              key={act.id}
                              activity={act.activity || act}
                              scheduledTime={act.start_time ? `${act.start_time.slice(0, 5)} - ${act.end_time?.slice(0, 5) || ''}` : null}
                              onRemove={() => onRemoveActivity && onRemoveActivity(stop.id, act.id)}
                              compact={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route Footer / Destination / Add City */}
      <div className="flex items-center gap-4 mt-2">
        <DestinationMarker isEnd={true} />
        <div className="flex items-center justify-between flex-1">
          <span className="text-label text-[11px]">END OF CURRENT ROUTE</span>
          <button
            onClick={onOpenCityDiscovery}
            className="btn btn-sm btn-terracotta"
          >
            <Plus size={14} /> Add Destination
          </button>
        </div>
      </div>
    </div>
  );
}
