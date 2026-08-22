import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsService } from '../services/trips';
import { citiesService } from '../services/cities';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import LoadingState from '../components/LoadingState';
import { formatDateRange, daysUntil } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { getCityImage } from '../utils/constants';
import {
  Plus,
  Compass,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsRes, citiesRes] = await Promise.all([
        tripsService.list({ limit: 4 }),
        citiesService.popular({ limit: 6 }),
      ]);
      setTrips(tripsRes.data?.trips || []);
      setPopularCities(citiesRes.data?.cities || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTrip = trips.find((t) => t.start_date && new Date(t.start_date) >= new Date()) || trips[0];
  const daysToDeparture = upcomingTrip?.start_date ? daysUntil(upcomingTrip.start_date) : null;

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={5} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-12">
      {/* Editorial Header */}
      <PageHeader
        stamp="TRAVEL LOG / OVERVIEW"
        coordinates="GLOBAL NAVIGATION SYSTEM"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Explorer'}.`}
        subtitle="Your journey canvas is ready. Review your upcoming departures, manage active itineraries, or discover your next route."
        action={
          <Link to="/trips/new" className="btn btn-terracotta no-underline shadow-xs">
            <Plus size={16} /> New Journey Canvas
          </Link>
        }
      />

      {/* Hero Featured Trip Banner (if user has a trip) */}
      {upcomingTrip ? (
        <div className="relative surface overflow-hidden bg-ink text-paper p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-md">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src={upcomingTrip.cover_photo || getCityImage(upcomingTrip.stops?.[0]?.city) || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80'}
              alt="Trip hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="travel-stamp text-terracotta bg-white/10 backdrop-blur-xs border-terracotta text-[9px]">
                FEATURED EXPEDITION
              </span>
              {daysToDeparture !== null && daysToDeparture >= 0 && (
                <span className="text-xs font-mono text-warm-gray-light">
                  • DEPARTS IN {daysToDeparture} DAYS
                </span>
              )}
            </div>

            <h2 className="font-display text-3xl md:text-5xl text-white leading-tight mb-2">
              {upcomingTrip.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-warm-gray-light font-light mt-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-terracotta" />
                <span>{formatDateRange(upcomingTrip.start_date, upcomingTrip.end_date) || 'Dates pending'}</span>
              </div>
              {upcomingTrip.total_budget && (
                <div className="flex items-center gap-1.5 font-mono">
                  <DollarSign size={13} className="text-olive" />
                  <span>Budget: {formatCurrency(upcomingTrip.total_budget, upcomingTrip.currency)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to={`/trips/${upcomingTrip.id}`}
              className="btn btn-terracotta !px-6 !py-3 no-underline shadow-sm flex items-center gap-2"
            >
              Open Journey Canvas <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        /* Empty Welcome State */
        <div className="surface p-10 text-center border-dashed border-2 border-warm-gray-lighter">
          <Compass size={40} className="mx-auto mb-3 text-terracotta" />
          <h3 className="font-display text-2xl text-ink mb-2">No Active Journeys Yet</h3>
          <p className="text-sm text-ink-muted max-w-md mx-auto mb-6 font-light">
            Start designing your first multi-city trip. Map your destinations, schedule day-by-day activities, and keep budget in sync.
          </p>
          <Link to="/trips/new" className="btn btn-terracotta no-underline">
            <Plus size={16} /> Create Your First Journey
          </Link>
        </div>
      )}

      {/* Recent Trips Section */}
      {trips.length > 0 && (
        <div>
          <SectionLabel
            label="YOUR RECENT EXPEDITIONS"
            count={trips.length}
            action={
              <Link to="/trips" className="text-xs text-terracotta font-semibold hover:underline flex items-center gap-1">
                View All Trips <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Destination Inspiration */}
      <div>
        <SectionLabel
          label="CURATED DESTINATIONS FOR YOUR CANVAS"
          action={
            <Link to="/discover" className="text-xs text-terracotta font-semibold hover:underline flex items-center gap-1">
              Explore All <ArrowRight size={12} />
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              onAdd={() => navigate(`/trips/new?destination=${encodeURIComponent(city.name)}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
