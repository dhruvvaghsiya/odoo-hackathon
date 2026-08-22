import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { activitiesService } from '../services/activities';
import { citiesService } from '../services/cities';
import ActivityCard from '../components/ActivityCard';
import CityCard from '../components/CityCard';
import LoadingState from '../components/LoadingState';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function Discover() {
  const [searchParams] = useSearchParams();
  const initialRegion = searchParams.get('region') || '';

  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'cities'
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('type');
  const [filterCategory, setFilterCategory] = useState(initialRegion ? initialRegion : 'all');
  const [sortBy, setSortBy] = useState('popularity');

  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'activities') {
        const res = await activitiesService.list({ limit: 50 });
        setActivities(res.data?.activities || []);
      } else {
        const res = await citiesService.list({ limit: 50 });
        setCities(res.data?.cities || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'activities') {
        const res = await activitiesService.search(searchQuery.trim() || 'all');
        setActivities(res.data?.activities || []);
      } else {
        const res = await citiesService.search(searchQuery.trim() || 'all');
        setCities(res.data?.cities || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // Filter & sort activities
  const filteredActivities = activities
    .filter((a) => {
      const matchText = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'all' || a.type?.toLowerCase() === filterCategory.toLowerCase();
      return matchText && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.cost || 0) - (b.cost || 0);
      if (sortBy === 'price_desc') return (b.cost || 0) - (a.cost || 0);
      if (sortBy === 'duration') return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.popularity || 0) - (a.popularity || 0);
    });

  return (
    <div className="page page-wide space-y-8">
      {/* Top Title */}
      <div className="border-b border-warm-gray-lighter pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-label text-[10px] block mb-1">
            ACTIVITY SEARCH PAGES / CITY ACTIVITY PAGE (SCREEN 8)
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-ink">Experiences & Sights Finder</h1>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Search world-class activities, sightseeing landmarks, and cultural options.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-paper-warm border border-warm-gray-lighter rounded-sm text-xs font-mono">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-xs font-bold transition-all ${
              activeTab === 'activities' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            ACTIVITIES (SCREEN 8)
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-3 py-1.5 rounded-xs font-bold transition-all ${
              activeTab === 'cities' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            DESTINATIONS
          </button>
        </div>
      </div>

      {/* ── Screen 8: Search bar + Group by + Filter + Sort by Controls ── */}
      <form onSubmit={handleSearchSubmit} className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input with Paragliding placeholder as in wireframe */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Paragliding, Louvre Museum, Scuba diving..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Group by */}
          <div className="flex items-center gap-1">
            <Layers size={14} className="text-ink-subtle" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="type">Group by: Category</option>
              <option value="none">Group by: None</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All Types</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="culture">Culture</option>
              <option value="food">Food & Dining</option>
              <option value="adventure">Adventure</option>
              <option value="nature">Nature</option>
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
              <option value="popularity">Sort by: Popularity</option>
              <option value="price_asc">Sort by: Price (Low to High)</option>
              <option value="price_desc">Sort by: Price (High to Low)</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm shrink-0">
            Search
          </button>
        </div>
      </form>

      {/* ── Screen 8: Results List ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">Results</h3>
          <span className="font-mono text-xs text-ink-subtle">
            [{activeTab === 'activities' ? filteredActivities.length : cities.length} Found]
          </span>
        </div>

        {loading ? (
          <LoadingState lines={8} />
        ) : activeTab === 'activities' ? (
          filteredActivities.length === 0 ? (
            <div className="surface p-12 text-center text-ink-subtle italic">
              No matching activity options found. Try searching for a different term.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink transition-colors"
                >
                  {/* Option and its details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="travel-stamp text-[9px] py-0">{act.type}</span>
                      {act.duration_minutes && (
                        <span className="text-[11px] font-mono text-ink-subtle flex items-center gap-1">
                          <Clock size={11} /> {act.duration_minutes} mins
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-xl text-ink">{act.name}</h4>
                    <p className="text-xs text-ink-muted font-light line-clamp-2">
                      {act.description || 'Option and its details'}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-warm-gray-lighter">
                    <span className="font-mono text-base font-bold text-ink">
                      {formatCurrency(act.cost || 0)}
                    </span>
                    <span className="text-[10px] text-olive font-semibold">
                      Popular Choice ★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
