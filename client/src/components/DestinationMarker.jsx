export default function DestinationMarker({
  order,
  active = false,
  isStart = false,
  isEnd = false,
  size = 'md',
}) {
  if (isStart || isEnd) {
    return (
      <div
        className={`flex items-center justify-center rounded-full border border-ink text-[10px] font-mono font-bold ${
          isStart ? 'bg-ink text-paper' : 'bg-paper text-ink'
        } ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}`}
      >
        {isStart ? 'S' : 'E'}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
        active
          ? 'bg-terracotta border-terracotta text-white scale-110 shadow-sm'
          : 'bg-paper border-terracotta text-terracotta hover:bg-terracotta/10'
      } ${size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs font-mono font-bold'}`}
    >
      {order || '●'}
    </div>
  );
}
