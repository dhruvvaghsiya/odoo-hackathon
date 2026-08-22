import { getCityImage } from '../utils/constants';
import { MapPin, Plus, DollarSign, Star } from 'lucide-react';

export default function CityCard({ city, onAdd, isAdded = false, compact = false }) {
  const imageUrl = getCityImage(city);

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

  if (compact) {
    return (
      <div className="surface p-3 flex items-center justify-between gap-3 group hover:border-ink transition-colors card-hover-lift">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={imageUrl}
            alt={city.name}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
            className="w-12 h-12 rounded object-cover shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <h4 className="font-display text-base text-ink truncate">{city.name}</h4>
            <p className="text-xs text-ink-subtle truncate flex items-center gap-1">
              <MapPin size={11} className="text-terracotta shrink-0" />
              {city.country}
            </p>
          </div>
        </div>
        {onAdd && (
          <button
            onClick={() => onAdd(city)}
            disabled={isAdded}
            className={`btn btn-sm shrink-0 ${isAdded ? 'btn-ghost text-olive' : 'btn-secondary'}`}
          >
            {isAdded ? 'Added' : '+ Add'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden group flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="relative h-44 overflow-hidden bg-paper-warm">
        <img
          src={imageUrl}
          alt={city.name}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[10px] tracking-widest font-mono uppercase bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-xs inline-block mb-1">
            {city.region || city.country}
          </span>
          <h3 className="font-display text-xl text-white leading-tight">{city.name}</h3>
        </div>
        {city.popularity > 80 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-xs text-[10px] font-bold text-terracotta flex items-center gap-1 shadow-xs">
            <Star size={10} fill="currentColor" /> Popular
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-ink-muted line-clamp-2 mb-4 font-light">
          {city.description || `Explore the rich culture, history, and sights of ${city.name}, ${city.country}.`}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-warm-gray-lighter">
          <div className="flex items-center gap-1 text-xs text-ink-subtle font-mono">
            <DollarSign size={12} className="text-olive" />
            <span>Index: {city.cost_index || 50}</span>
          </div>

          {onAdd && (
            <button
              onClick={() => onAdd(city)}
              disabled={isAdded}
              className={`btn btn-sm ${
                isAdded ? 'bg-olive-muted text-olive border-none cursor-default' : 'btn-terracotta'
              }`}
            >
              {isAdded ? 'Added' : <><Plus size={14} /> Add to Journey</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
