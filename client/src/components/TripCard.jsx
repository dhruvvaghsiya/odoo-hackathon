import { Link } from 'react-router-dom';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { getCityImage } from '../utils/constants';
import { Calendar, MapPin, ArrowRight, Share2 } from 'lucide-react';

export default function TripCard({ trip, onDelete, onShare }) {
  // If stops are embedded or cover photo is set
  const firstStop = trip.stops?.[0]?.city || null;
  const coverImage = trip.cover_photo || getCityImage(firstStop) || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

  const stopCities = trip.stops?.map((s) => s.city?.name).filter(Boolean) || [];

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';

  return (
    <div className="surface overflow-hidden group flex flex-col justify-between hover:shadow-md hover:border-ink transition-all duration-300 card-hover-lift card-shimmer relative">
      <div className="relative h-48 overflow-hidden bg-paper-warm">
        <img
          src={coverImage}
          alt={trip.name}
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {trip.is_public && (
            <span className="travel-stamp travel-stamp--olive text-[9px] bg-white/90 backdrop-blur-xs py-0.5">
              Public Journey
            </span>
          )}
          {trip.currency && (
            <span className="travel-stamp travel-stamp--ink text-[9px] bg-white/90 backdrop-blur-xs py-0.5 font-mono">
              {trip.currency}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1.5 text-xs text-paper-warm font-light mb-1">
            <Calendar size={12} className="text-terracotta shrink-0" />
            <span>{formatDateRange(trip.start_date, trip.end_date) || 'Dates pending'}</span>
          </div>
          <h3 className="font-display text-2xl text-white leading-tight">{trip.name}</h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {stopCities.length > 0 ? (
            <div className="mb-3">
              <span className="text-label text-[10px] block mb-1">Route</span>
              <div className="flex items-center flex-wrap gap-1 text-xs text-ink-muted">
                {stopCities.map((cityName, idx) => (
                  <span key={idx} className="inline-flex items-center">
                    <span className="font-medium text-ink">{cityName}</span>
                    {idx < stopCities.length - 1 && (
                      <span className="mx-1 text-warm-gray-dark">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-subtle italic mb-3 font-light">
              No destinations mapped yet.
            </p>
          )}

          {trip.description && (
            <p className="text-xs text-ink-muted line-clamp-2 font-light mb-3">
              {trip.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-warm-gray-lighter flex items-center justify-between">
          <div className="text-xs">
            <span className="text-ink-subtle block text-[10px] font-mono uppercase">Budget</span>
            <span className="font-mono font-semibold text-ink">
              {trip.total_budget ? formatCurrency(trip.total_budget, trip.currency) : 'Unset'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/trips/${trip.id}`}
              className="btn btn-sm btn-secondary group-hover:btn-primary transition-all no-underline"
            >
              Canvas <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
