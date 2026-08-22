import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import CityCard from './CityCard';
import { citiesService } from '../services/cities';
import { Search, Filter, Compass, Loader2 } from 'lucide-react';

export default function CityDiscovery({
  isOpen,
  onClose,
  onSelectCity,
  existingCityIds = [],
}) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInitialCities();
    }
  }, [isOpen]);

  const loadInitialCities = async () => {
    setLoading(true);
    try {
      const res = await citiesService.popular();
      setCities(res.data?.cities || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        const res = await citiesService.search(searchQuery.trim());
        setCities(res.data?.cities || []);
      } else {
        await loadInitialCities();
      }
    } catch (err) {
      console.error('City search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = regionFilter
    ? cities.filter((c) => c.region?.toLowerCase().includes(regionFilter.toLowerCase()) || c.country?.toLowerCase().includes(regionFilter.toLowerCase()))
    : cities;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Discover Destinations" position="right">
      <div className="space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search cities or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm shrink-0">
            Search
          </button>
        </form>

        {/* Region Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setRegionFilter('')}
            className={`px-2.5 py-1 rounded-xs font-mono transition-colors ${
              !regionFilter ? 'bg-ink text-paper' : 'bg-paper-warm text-ink-muted hover:text-ink'
            }`}
          >
            ALL
          </button>
          {['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'].map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(regionFilter === region ? '' : region)}
              className={`px-2.5 py-1 rounded-xs font-mono transition-colors ${
                regionFilter === region ? 'bg-ink text-paper' : 'bg-paper-warm text-ink-muted hover:text-ink'
              }`}
            >
              {region.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-ink-subtle gap-2">
              <Loader2 className="animate-spin text-terracotta" size={24} />
              <span className="text-xs font-mono">Exploring map coordinates...</span>
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="py-12 text-center text-ink-subtle">
              <Compass size={32} className="mx-auto mb-2 opacity-40 text-terracotta" />
              <p className="text-sm">No matching destinations found.</p>
              <span className="text-xs">Try searching for a different city or region.</span>
            </div>
          ) : (
            filteredCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                compact={true}
                isAdded={existingCityIds.includes(city.id)}
                onAdd={(selected) => {
                  onSelectCity(selected);
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
