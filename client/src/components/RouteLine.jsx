export default function RouteLine({ className = '', dashed = false }) {
  return (
    <div
      className={`w-0.5 self-stretch my-1 transition-all ${
        dashed
          ? 'border-l-2 border-dashed border-warm-gray-lighter'
          : 'bg-warm-gray-lighter'
      } ${className}`}
    />
  );
}
