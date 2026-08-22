import { formatCurrency } from '../utils/formatCurrency';
import { ACTIVITY_TYPES } from '../utils/constants';
import { Clock, Plus, Trash2, Check } from 'lucide-react';

export default function ActivityCard({
  activity,
  onAdd,
  onRemove,
  isAdded = false,
  scheduledTime,
  compact = false,
  showNotes = false,
}) {
  const typeConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;
  const durationHours = activity.duration_minutes
    ? activity.duration_minutes >= 60
      ? `${(activity.duration_minutes / 60).toFixed(activity.duration_minutes % 60 === 0 ? 0 : 1)}h`
      : `${activity.duration_minutes}m`
    : null;

  if (compact) {
    return (
      <div className="surface p-3 flex items-center justify-between gap-3 group hover:border-ink transition-colors">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs badge--${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            {scheduledTime && (
              <span className="text-xs font-mono font-medium text-ink-subtle">
                {scheduledTime}
              </span>
            )}
          </div>
          <h4 className="font-display text-sm text-ink truncate mt-0.5">{activity.name}</h4>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-medium text-ink">
            {formatCurrency(activity.cost || activity.estimated_cost || 0)}
          </span>
          {onRemove && (
            <button
              onClick={() => onRemove(activity.id)}
              className="text-ink-subtle hover:text-danger p-1"
              aria-label="Remove activity"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-4 flex flex-col justify-between hover:border-ink-muted transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-xs badge--${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <div className="flex items-center gap-2 text-xs text-ink-subtle font-mono">
            {durationHours && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {durationHours}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-display text-base text-ink mb-1">{activity.name}</h4>
        {activity.description && (
          <p className="text-xs text-ink-muted line-clamp-2 font-light mb-3">
            {activity.description}
          </p>
        )}

        {showNotes && activity.notes && (
          <div className="bg-paper-warm p-2 rounded text-xs text-ink-muted italic mb-3">
            "{activity.notes}"
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-warm-gray-lighter mt-2">
        <span className="font-mono text-sm font-semibold text-ink">
          {formatCurrency(activity.cost || activity.estimated_cost || 0)}
        </span>

        {onAdd && (
          <button
            onClick={() => onAdd(activity)}
            disabled={isAdded}
            className={`btn btn-sm ${
              isAdded
                ? 'bg-olive-muted text-olive border-none cursor-default'
                : 'btn-secondary'
            }`}
          >
            {isAdded ? (
              <><Check size={13} /> Added</>
            ) : (
              <><Plus size={13} /> Add</>
            )}
          </button>
        )}

        {onRemove && (
          <button
            onClick={() => onRemove(activity.id)}
            className="btn btn-sm btn-ghost text-danger hover:bg-danger-muted"
          >
            <Trash2 size={13} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}
