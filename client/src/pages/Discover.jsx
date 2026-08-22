import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { citiesService } from '../services/cities';
import { activitiesService } from '../services/activities';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import CityCard from '../components/CityCard';
import ActivityCard from '../components/ActivityCard';
import LoadingState from '../components/LoadingState';
import { Search, Compass, Sparkles } from 'lucide-react';

export default function Discover() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' | 'activities'
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDiscoveryData();
  }, [activeTab]);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'cities') {
        const res = await citiesService.list({ limit: 30 });
        setCities(res.data?.cities || []);
      } else {
        const res = await activitiesService.list({ limit: 30 });
        setActivities(res.data?.activities || []);
      }
    } catch (err) {
      console.error('Failed to load discovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return loadDiscoveryData();

    setLoading(true);
    try {
      if (activeTab === 'cities') {
        const res = await citiesService.search(searchQuery.trim());
        setCities(res.data?.cities || []);
      } else {
        const res = await activitiesService.search(searchQuery.trim());
        setActivities(res.data?.activities || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-wide space-y-8">
      <PageHeader
        stamp="GLOBAL DIRECTORY"
        coordinates="EXPLORATION COMPASS"
        title="Discover the Globe"
        subtitle="Explore vibrant cities, world-class landmarks, and curated activities to include in your next journey canvas."
      />

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-paper-warm border border-warm-gray-lighter rounded-sm text-xs font-mono">
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 rounded-xs font-bold transition-all ${
              activeTab === 'cities' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            DESTINATIONS ({cities.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xs font-bold transition-all ${
              activeTab === 'activities' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            EXPERIENCES ({activities.length})
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm shrink-0">
            Search
          </button>
        </form>
      </div>

      {/* Content Grid */}
      {loading ? (
        <LoadingState lines={8} />
      ) : activeTab === 'cities' ? (
        cities.length === 0 ? (
          <div className="text-center py-16 text-ink-subtle">
            <Compass size={40} className="mx-auto mb-3 opacity-40 text-terracotta" />
            <p className="text-sm">No destinations found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onAdd={() => navigate(`/trips/new?destination=${encodeURIComponent(city.name)}`)}
              />
            ))}
          </div>
        )
      ) : activities.length === 0 ? (
        <div className="text-center py-16 text-ink-subtle">
          <Sparkles size={40} className="mx-auto mb-3 opacity-40 text-terracotta" />
          <p className="text-sm">No curated activities found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
        </div>
      )}
    </div>
  );
}
