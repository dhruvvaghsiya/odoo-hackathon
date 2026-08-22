export default function PageHeader({ title, subtitle, stamp, coordinates, action, children }) {
  return (
    <div className="mb-8 md:mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {stamp && <span className="travel-stamp">{stamp}</span>}
            {coordinates && <span className="coordinates">{coordinates}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-ink tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-ink-muted text-base md:text-lg mt-2 max-w-2xl font-light">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
