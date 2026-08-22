import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsService } from '../services/trips';
import TripCard from '../components/TripCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Plus,
  Map,
  Search,
  SlidersHorizontal,
  Filter,
  Layers,
  Calendar,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('status');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await tripsService.list({ limit: 100 });
      setTrips(res.data?.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  // Categorize trips into Ongoing, Upcoming, Completed
  const ongoingTrips = [];
  const upcomingTrips = [];
  const completedTrips = [];

  trips.forEach((t) => {
    if (!t.start_date && !t.end_date) {
      upcomingTrips.push(t);
      return;
    }
    const start = t.start_date ? new Date(t.start_date) : null;
    const end = t.end_date ? new Date(t.end_date) : null;

    if (start && end && now >= start && now <= end) {
      ongoingTrips.push(t);
    } else if (start && start > now) {
      upcomingTrips.push(t);
    } else {
      completedTrips.push(t);
    }
  });

  const filterAndSortList = (list) => {
    return list
      .filter((t) => {
        const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.start_date || 0) - new Date(a.start_date || 0);
        if (sortBy === 'date_asc') return new Date(a.start_date || 0) - new Date(b.start_date || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  };

  const filteredOngoing = filterAndSortList(ongoingTrips);
  const filteredUpcoming = filterAndSortList(upcomingTrips);
  const filteredCompleted = filterAndSortList(completedTrips);

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={6} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray-lighter pb-4">
        <div>
          <span className="text-label text-[10px] block mb-1">USER TRIP LISTING (SCREEN 6)</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink">User Trip Listing</h1>
          <p className="text-xs text-ink-muted mt-1 font-light">
            All your ongoing, upcoming, and completed journey overviews.
          </p>
        </div>
        <Link to="/trips/new" className="btn btn-terracotta no-underline shadow-xs">
          <Plus size={16} /> + Plan a Trip
        </Link>
      </div>

      {/* ── Screen 6: Search Bar + Group by + Filter + Sort by Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ....."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1">
            <Layers size={14} className="text-ink-subtle" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="status">Group by: Status</option>
              <option value="none">Group by: None</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All</option>
              <option value="ongoing">Filter: Ongoing</option>
              <option value="upcoming">Filter: Upcoming</option>
              <option value="completed">Filter: Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-ink-subtle" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="date_desc">Sort by: Departure</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 6: Categorized Sections (Ongoing, Up-coming, Completed) ── */}
      <div className="space-y-10">
        {/* Section: Ongoing */}
        {(filterCategory === 'all' || filterCategory === 'ongoing') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-olive animate-pulse" />
                <h3 className="font-display text-2xl text-ink">Ongoing</h3>
              </div>
              <span className="font-mono text-xs text-ink-subtle">[{filteredOngoing.length}]</span>
            </div>

            {filteredOngoing.length === 0 ? (
              <div className="surface p-6 text-center text-xs text-ink-subtle italic">
                No active ongoing journeys at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOngoing.map((trip) => (
                  <div key={trip.id} className="surface p-5 hover:border-ink transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="travel-stamp travel-stamp--olive text-[9px]">ONGOING EXPEDITION</span>
                        <span className="font-mono text-xs font-bold text-ink">
                          {formatCurrency(trip.total_budget || 0, trip.currency)}
                        </span>
                      </div>
                      <h4 className="font-display text-2xl text-ink leading-tight">{trip.name}</h4>
                      <p className="text-xs text-ink-muted mt-2 font-light line-clamp-2">
                        {trip.description || 'Short Over View of the Trip'}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-warm-gray-lighter flex justify-between items-center text-xs">
                      <span className="font-mono text-ink-subtle">
                        {formatDateRange(trip.start_date, trip.end_date) || 'Flexible dates'}
                      </span>
                      <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-terracotta no-underline">
                        View Canvas <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section: Up-coming */}
        {(filterCategory === 'all' || filterCategory === 'upcoming') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
              <h3 className="font-display text-2xl text-ink">Up-coming</h3>
              <span className="font-mono text-xs text-ink-subtle">[{filteredUpcoming.length}]</span>
            </div>

            {filteredUpcoming.length === 0 ? (
              <div className="surface p-6 text-center text-xs text-ink-subtle italic">
                No upcoming trips planned. Click "+ Plan a Trip" to start a new route.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUpcoming.map((trip) => (
                  <div key={trip.id} className="surface p-5 hover:border-ink transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="travel-stamp text-[9px]">UPCOMING EXPEDITION</span>
                        <span className="font-mono text-xs font-bold text-ink">
                          {formatCurrency(trip.total_budget || 0, trip.currency)}
                        </span>
                      </div>
                      <h4 className="font-display text-2xl text-ink leading-tight">{trip.name}</h4>
                      <p className="text-xs text-ink-muted mt-2 font-light line-clamp-2">
                        {trip.description || 'Short Over View of the Trip'}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-warm-gray-lighter flex justify-between items-center text-xs">
                      <span className="font-mono text-ink-subtle">
                        {formatDateRange(trip.start_date, trip.end_date) || 'Flexible dates'}
                      </span>
                      <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-terracotta no-underline">
                        View Canvas <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section: Completed */}
        {(filterCategory === 'all' || filterCategory === 'completed') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
              <h3 className="font-display text-2xl text-ink">Completed</h3>
              <span className="font-mono text-xs text-ink-subtle">[{filteredCompleted.length}]</span>
            </div>

            {filteredCompleted.length === 0 ? (
              <div className="surface p-6 text-center text-xs text-ink-subtle italic">
                No completed trips recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCompleted.map((trip) => (
                  <div key={trip.id} className="surface p-5 hover:border-ink transition-colors flex flex-col justify-between opacity-80 hover:opacity-100">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="travel-stamp travel-stamp--ink text-[9px]">COMPLETED EXPEDITION</span>
                        <span className="font-mono text-xs font-bold text-ink">
                          {formatCurrency(trip.total_budget || 0, trip.currency)}
                        </span>
                      </div>
                      <h4 className="font-display text-2xl text-ink leading-tight">{trip.name}</h4>
                      <p className="text-xs text-ink-muted mt-2 font-light line-clamp-2">
                        {trip.description || 'Short Over View of the Trip'}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-warm-gray-lighter flex justify-between items-center text-xs">
                      <span className="font-mono text-ink-subtle">
                        {formatDateRange(trip.start_date, trip.end_date) || 'Dates recorded'}
                      </span>
                      <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-secondary no-underline">
                        View Canvas <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
