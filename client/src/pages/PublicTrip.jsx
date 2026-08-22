import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shareService } from '../services/share';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import DestinationMarker from '../components/DestinationMarker';
import ActivityCard from '../components/ActivityCard';
import { formatDateRange, formatDateShort } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { getCityImage } from '../utils/constants';
import {
  MapPin,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Share2,
  Compass,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

export default function PublicTrip() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    loadPublicTrip();
  }, [token]);

  const loadPublicTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shareService.getPublic(token);
      setItinerary(res.data || null);
    } catch (err) {
      setError(err.message || 'Public journey story not found or link deactivated.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to copy this journey to your passport.');
      navigate('/login');
      return;
    }

    setCopying(true);
    try {
      const res = await shareService.copyTrip(token);
      const copiedTrip = res.data?.trip;
      toast.success('Journey successfully cloned into your passport!');
      navigate(`/trips/${copiedTrip?.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to clone journey.');
    } finally {
      setCopying(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast.success('Story URL copied to clipboard.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <LoadingState lines={6} />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <ErrorState message={error || 'Story expired'} />
      </div>
    );
  }

  const { trip, stops = [], summary } = itinerary;
  const heroImage = trip.cover_photo || getCityImage(stops[0]?.city) || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80';

  return (
    <div className="min-h-screen bg-paper pb-24 selection:bg-terracotta/20">
      {/* Top Floating Magazine Header */}
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-warm-gray-lighter px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-terracotta" strokeWidth={2.5} />
          <span className="font-display text-lg text-ink">GlobeTrotter</span>
          <span className="travel-stamp travel-stamp--olive text-[9px] ml-2">
            DIGITAL TRAVEL STORY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="btn btn-secondary btn-sm text-xs"
            title="Share Story"
          >
            {copiedUrl ? <Check size={13} className="text-olive" /> : <Share2 size={13} />}
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleCopyTrip}
            disabled={copying}
            className="btn btn-terracotta btn-sm text-xs shadow-xs"
          >
            <Copy size={13} />
            <span>{copying ? 'Cloning...' : 'Copy Journey to Account'}</span>
          </button>
        </div>
      </header>

      {/* Hero Magazine Cover */}
      <section className="relative h-[70vh] min-h-[480px] bg-ink text-paper overflow-hidden">
        <img
          src={heroImage}
          alt={trip.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

        <div className="absolute inset-0 max-w-5xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="travel-stamp text-terracotta bg-white/10 backdrop-blur-xs border-terracotta text-xs">
              EXPLORER DISPATCH
            </span>
            <span className="coordinates text-xs text-warm-gray-light font-mono">
              {summary?.number_of_cities || stops.length} DESTINATIONS • {summary?.total_days || 'FLEXIBLE'} DAYS
            </span>
          </div>

          {/* Large City Sequence Header */}
          <div className="flex items-center flex-wrap gap-2 text-sm md:text-base font-mono uppercase tracking-widest text-warm-gray-light mb-2">
            {stops.map((stop, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span className="text-paper font-bold">{stop.city?.name}</span>
                {idx < stops.length - 1 && <span className="text-terracotta">↓</span>}
              </span>
            ))}
          </div>

          <h1 className="text-display text-4xl md:text-7xl text-white leading-tight font-normal">
            {trip.name}
          </h1>

          {trip.description && (
            <p className="text-warm-gray-light text-base md:text-lg font-light max-w-2xl mt-4 leading-relaxed">
              {trip.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/20 text-xs text-warm-gray-light font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-terracotta" />
              {formatDateRange(trip.start_date, trip.end_date) || 'Dates flexible'}
            </span>
            {trip.total_budget && (
              <span className="flex items-center gap-1.5">
                <DollarSign size={13} className="text-olive" />
                Target Budget: {formatCurrency(trip.total_budget, trip.currency)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Magazine Body: Destinations & Experiences */}
      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-16">
        {/* Editorial Section Introduction */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-label text-terracotta mb-2 block">THE EXPEDITION ROUTE</span>
          <h2 className="font-display text-3xl md:text-4xl text-ink">
            A Curated Chronicle of Movement & Discovery
          </h2>
        </div>

        {/* Stops Sequence */}
        <div className="space-y-16">
          {stops.map((stop, index) => {
            const cityImage = getCityImage(stop.city);
            const activities = stop.activities || [];

            return (
              <article key={stop.id} className="space-y-6">
                {/* Destination Editorial Header */}
                <div className="surface overflow-hidden">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={cityImage}
                      alt={stop.city?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="travel-stamp text-terracotta bg-white/20 backdrop-blur-xs text-[10px]">
                          DESTINATION {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="coordinates text-[10px] text-warm-gray-light">
                          {stop.city?.country}
                        </span>
                      </div>
                      <h3 className="font-display text-3xl md:text-5xl text-white leading-tight">
                        {stop.city?.name}
                      </h3>
                      <p className="text-xs text-warm-gray-light mt-1 font-light flex items-center gap-2">
                        <Calendar size={12} className="text-terracotta" />
                        {formatDateRange(stop.start_date, stop.end_date) || 'Duration flexible'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-ink-muted font-light leading-relaxed mb-6">
                      {stop.city?.description ||
                        `Explore the architecture, local delicacies, and cultural highlights of ${stop.city?.name}.`}
                    </p>

                    {/* Activities inside this destination */}
                    {activities.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-warm-gray-lighter">
                        <span className="text-label text-[10px]">
                          CURATED EXPERIENCES ({activities.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activities.map((act) => (
                            <ActivityCard
                              key={act.id}
                              activity={act.activity || act}
                              scheduledTime={act.start_time ? `${act.start_time.slice(0, 5)} - ${act.end_time?.slice(0, 5) || ''}` : null}
                              compact={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Connection Arrow between destinations */}
                {index < stops.length - 1 && (
                  <div className="flex items-center justify-center py-2 text-warm-gray">
                    <ArrowDown size={24} className="animate-bounce" />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Story Footer & Clone Callout */}
        <div className="surface p-8 text-center bg-paper-warm border border-warm-gray-lighter space-y-4">
          <Sparkles size={32} className="mx-auto text-terracotta" />
          <h3 className="font-display text-2xl text-ink">Inspired by this journey?</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto font-light">
            Clone this exact itinerary into your personal GlobeTrotter passport to customize dates, adjust activities, and track your live expenses.
          </p>
          <button
            onClick={handleCopyTrip}
            disabled={copying}
            className="btn btn-terracotta !px-6 !py-3"
          >
            <Copy size={15} />
            <span>{copying ? 'Cloning to Passport...' : 'Clone Journey into My Account'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
