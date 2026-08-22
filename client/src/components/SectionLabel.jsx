export default function SectionLabel({ label, count, action, className = '' }) {
  return (
    <div className={`section-label mb-4 ${className}`}>
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-ink-subtle text-xs font-mono font-normal">[{String(count).padStart(2, '0')}]</span>
      )}
      {action && <div className="ml-auto flex items-center">{action}</div>}
    </div>
  );
}
