export default function LoadingState({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-4 animate-fade-in ${className}`} role="status" aria-label="Loading">
      <div className="skeleton skeleton-title" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${85 - i * 15}%` }} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="surface p-4 space-y-3">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '70%' }} />
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="flex gap-4 p-4">
      <div className="skeleton w-24 h-24 shrink-0" style={{ borderRadius: 'var(--radius-md)' }} />
      <div className="flex-1 space-y-2">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
        <div className="skeleton skeleton-text" style={{ width: '30%' }} />
      </div>
    </div>
  );
}
