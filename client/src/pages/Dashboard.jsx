import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripsService } from '../services/trips';
import { citiesService } from '../services/cities';
import TripCard from '../components/TripCard';
import CityCard from '../components/CityCard';
import LoadingState from '../components/LoadingState';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { getCityImage } from '../utils/constants';
import {
  Plus,
  Compass,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Filter,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

const REGIONS = [
  { name: 'Europe', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80', description: 'Historic castles, alpine peaks & rich culture' },
  { name: 'Asia', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80', description: 'Ancient temples, futuristic skylines & night markets' },
  { name: 'Americas', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80', description: 'National parks, iconic cities & vibrant rhythms' },
  { name: 'Africa', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80', description: 'Safari plains, coastal dunes & spice markets' },
  { name: 'Oceania', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80', description: 'Reef adventures, fjord treks & sun-kissed harbors' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen 3 Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tripsRes, citiesRes] = await Promise.all([
        tripsService.list({ limit: 12 }),
        citiesService.popular({ limit: 8 }),
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

  // Filter & sort trips
  const filteredTrips = trips
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.start_date || 0) - new Date(b.start_date || 0);
      if (sortBy === 'date_desc') return new Date(b.start_date || 0) - new Date(a.start_date || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget') return (b.total_budget || 0) - (a.total_budget || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={6} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-10">
      {/* ── Screen 3: Hero Banner Image ─────────────────────────────────── */}
      <div className="relative surface overflow-hidden bg-ink text-paper rounded-lg shadow-md min-h-[320px] md:min-h-[420px] flex flex-col justify-end p-6 md:p-10 animate-fade-in">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[8000ms] ease-linear hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

        {/* Animated floating coordinates top-right */}
        <div className="absolute top-4 right-5 font-mono text-[10px] text-white/40 tracking-widest animate-fade-in" style={{ animationDelay: '600ms' }}>
          48.8566°N, 2.3522°E
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="travel-stamp text-terracotta bg-white/10 backdrop-blur-xs border-terracotta text-[10px] animate-stamp" style={{ animationDelay: '200ms' }}>
            JOURNEY CANVAS · GLOBETROTTER
          </span>
          <h1 className="text-display text-3xl md:text-5xl text-white font-normal leading-tight animate-slide-up" style={{ animationDelay: '100ms' }}>
            The world is not a problem<br />to be solved. <em>It is a place</em><br />to be explored.
          </h1>
          <p className="text-warm-gray-light text-sm md:text-base font-light animate-fade-in" style={{ animationDelay: '300ms' }}>
            Welcome back, <strong className="text-terracotta">{user?.name || 'Explorer'}</strong>. Your next adventure is waiting.
          </p>
          <div className="pt-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link to="/trips/new" className="btn btn-terracotta no-underline shadow-sm">
              <Plus size={16} /> + Plan a trip
            </Link>
          </div>
        </div>
      </div>

      {/* ── Animated Journey Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Journeys Planned', value: trips.length, icon: '✈', suffix: '' },
          { label: 'Destinations', value: trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0), icon: '📍', suffix: '' },
          { label: 'Countries Explored', value: Math.min(trips.length * 2, 32), icon: '🌍', suffix: '+' },
        ].map((stat) => (
          <div key={stat.label} className="surface p-4 md:p-5 flex items-center gap-3 card-hover-lift">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="font-display text-2xl md:text-3xl text-ink animate-count">{stat.value}{stat.suffix}</div>
              <div className="text-[11px] text-ink-subtle font-mono uppercase tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Screen 3: Search Bar + Group By + Filter + Sort By Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ..... (search trips, destinations)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-sm input-glow"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Group by */}
          <div className="flex items-center gap-1">
            <Layers size={14} className="text-ink-subtle" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="none">Group by: None</option>
              <option value="status">Group by: Status</option>
              <option value="year">Group by: Year</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Americas">Americas</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          {/* Sort by */}
          <div className="flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-ink-subtle" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="date_desc">Sort by: Newest</option>
              <option value="date_asc">Sort by: Oldest</option>
              <option value="name">Sort by: Name</option>
              <option value="budget">Sort by: Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 3: Top Regional Selections ─────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">Top Regional Selections</h3>
          <span className="text-xs text-ink-subtle font-mono">GLOBAL DESTINATIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 stagger-children">
          {REGIONS.map((region) => (
            <div
              key={region.name}
              onClick={() => navigate(`/discover?region=${encodeURIComponent(region.name)}`)}
              className="surface overflow-hidden group cursor-pointer hover:shadow-md hover:border-ink transition-all duration-300 flex flex-col card-hover-lift card-shimmer relative"
            >
              <div className="relative h-28 overflow-hidden bg-paper-warm">
                <img
                  src={region.image}
                  alt={region.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white font-display text-lg">
                  {region.name}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <p className="text-[11px] text-ink-muted line-clamp-2 font-light">
                  {region.description}
                </p>
                <span className="text-[10px] text-terracotta font-semibold mt-2 block">
                  Explore Region →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Screen 3: Previous Trips + Plan a trip CTA ─────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">Previous Trips</h3>
          <Link to="/trips/new" className="btn btn-terracotta btn-sm no-underline shadow-xs">
            <Plus size={14} /> + Plan a trip
          </Link>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="surface p-10 text-center border-dashed border-2 border-warm-gray-lighter">
            <Compass size={36} className="mx-auto mb-2 text-terracotta opacity-60" />
            <h4 className="font-display text-xl text-ink">No Recorded Trips Yet</h4>
            <p className="text-xs text-ink-muted max-w-sm mx-auto my-3 font-light">
              You have not created any journeys yet. Start planning your first itinerary.
            </p>
            <Link to="/trips/new" className="btn btn-terracotta btn-sm no-underline">
              <Plus size={14} /> + Plan a trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
