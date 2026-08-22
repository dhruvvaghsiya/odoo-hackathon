import { formatDateRange } from '../utils/formatDate';
import { Calendar } from 'lucide-react';

export default function TripDateLabel({ startDate, endDate, showIcon = true, className = '' }) {
  const formatted = formatDateRange(startDate, endDate);
  if (!formatted) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 date-label ${className}`}>
      {showIcon && <Calendar size={13} className="text-ink-subtle shrink-0" />}
      <span>{formatted}</span>
    </span>
  );
}
