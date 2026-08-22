import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsService } from '../services/trips';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import TripCard from '../components/TripCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Plus, Map, Search, SlidersHorizontal } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('start_date');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await tripsService.list({ limit: 50 });
      setTrips(res.data?.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips
    .filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'start_date') {
        return new Date(b.start_date || 0) - new Date(a.start_date || 0);
      }
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      }
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
    <div className="page page-wide space-y-8">
      <PageHeader
        stamp="PASSPORT / ARCHIVE"
        coordinates="EXPEDITION REPOSITORY"
        title="Your Journey Archive"
        subtitle="Every journey designed, mapped, and completed in your personal travel record."
        action={
          <Link to="/trips/new" className="btn btn-terracotta no-underline shadow-xs">
            <Plus size={16} /> New Journey
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Filter your expeditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <SlidersHorizontal size={14} className="text-ink-subtle" />
          <span className="text-label text-[10px]">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input-field !py-1.5 !px-2 text-xs font-mono"
          >
            <option value="start_date">Departure Date</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No Journeys Found"
          description={
            searchQuery
              ? "No trips matched your search criteria. Try a different keyword."
              : "You have not recorded any journeys yet. Start plotting your next adventure on the canvas."
          }
          action={
            <Link to="/trips/new" className="btn btn-terracotta no-underline">
              <Plus size={16} /> Create New Trip
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
