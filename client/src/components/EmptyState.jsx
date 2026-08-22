export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-paper-warm flex items-center justify-center mb-4">
          <Icon size={28} className="text-warm-gray" />
        </div>
      )}
      <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-ink-subtle max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
