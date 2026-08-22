import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import ActivityCard from './ActivityCard';
import { citiesService } from '../services/cities';
import { activitiesService } from '../services/activities';
import { ACTIVITY_TYPES } from '../utils/constants';
import { Search, Loader2, Sparkles } from 'lucide-react';

export default function ActivityDiscovery({
  isOpen,
  onClose,
  stop,
  onSelectActivity,
  existingActivityIds = [],
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && stop) {
      loadActivities();
    }
  }, [isOpen, stop]);

  const loadActivities = async () => {
    if (!stop?.city_id) return;
    setLoading(true);
    try {
      // First try to fetch city-specific activities
      const res = await citiesService.getActivities(stop.city_id);
      const items = res.data?.activities || [];
      if (items.length > 0) {
        setActivities(items);
      } else {
        // Fallback to general activities
        const genRes = await activitiesService.popular();
        setActivities(genRes.data?.activities || []);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      return loadActivities();
    }
    setLoading(true);
    try {
      const res = await activitiesService.search(searchQuery.trim());
      setActivities(res.data?.activities || []);
    } catch (err) {
      console.error('Activity search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = typeFilter
    ? activities.filter((a) => a.type === typeFilter)
    : activities;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Activities in ${stop?.city?.name || 'Destination'}`}
      position="right"
    >
      <div className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm shrink-0">
            Search
          </button>
        </form>

        {/* Type Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-2 py-1 rounded-xs font-mono transition-colors ${
              !typeFilter ? 'bg-ink text-paper' : 'bg-paper-warm text-ink-muted hover:text-ink'
            }`}
          >
            ALL
          </button>
          {Object.entries(ACTIVITY_TYPES).slice(0, 6).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
              className={`px-2 py-1 rounded-xs font-mono whitespace-nowrap transition-colors ${
                typeFilter === key ? 'bg-ink text-paper' : 'bg-paper-warm text-ink-muted hover:text-ink'
              }`}
            >
              {config.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-ink-subtle gap-2">
              <Loader2 className="animate-spin text-terracotta" size={24} />
              <span className="text-xs font-mono">Curating experiences...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-ink-subtle">
              <Sparkles size={32} className="mx-auto mb-2 opacity-40 text-terracotta" />
              <p className="text-sm">No matching experiences found.</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isAdded={existingActivityIds.includes(activity.id)}
                onAdd={(act) => {
                  onSelectActivity(stop.id, act);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
}
