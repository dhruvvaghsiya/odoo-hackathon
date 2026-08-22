import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripsService } from '../services/trips';
import { citiesService } from '../services/cities';
import { activitiesService } from '../services/activities';
import { useToast } from '../context/ToastContext';
import { getCityImage } from '../utils/constants';
import { formatCurrency } from '../utils/formatCurrency';
import { formatErrorMessage } from '../utils/formatError';
import {
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  Plus,
  Compass,
} from 'lucide-react';

export default function CreateTrip() {
  const [searchParams] = useSearchParams();
  const initialDestination = searchParams.get('destination') || '';

  const [name, setName] = useState(initialDestination ? `Journey to ${initialDestination}` : 'Mediterranean Summer Odyssey');
  const [startDate, setStartDate] = useState('2026-06-15');
  const [endDate, setEndDate] = useState('2026-06-28');
  const [selectedPlace, setSelectedPlace] = useState(initialDestination || 'Paris, France');
  const [totalBudget, setTotalBudget] = useState('3500');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Suggestions state (Screen 4)
  const [suggestions, setSuggestions] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const [citiesRes, activitiesRes] = await Promise.all([
        citiesService.popular({ limit: 6 }),
        activitiesService.popular({ limit: 6 }),
      ]);
      setCitiesList(citiesRes.data?.cities || []);

      // Combine suggestions
      const places = (citiesRes.data?.cities || []).slice(0, 3).map((c) => ({
        id: `city-${c.id}`,
        title: c.name,
        subtitle: c.country,
        category: 'PLACE',
        image: getCityImage(c),
        cost: c.cost_index,
      }));

      const acts = (activitiesRes.data?.activities || []).slice(0, 3).map((a) => ({
        id: `act-${a.id}`,
        title: a.name,
        subtitle: a.type,
        category: 'ACTIVITY',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
        cost: a.cost,
      }));

      setSuggestions([...places, ...acts]);
    } catch {
      // Non-critical fallback
    }
  };

  const handleSelectSuggestion = (sug) => {
    if (sug.category === 'PLACE') {
      setSelectedPlace(`${sug.title}, ${sug.subtitle}`);
      setName(`Journey to ${sug.title}`);
    } else {
      setName(`Trip with ${sug.title}`);
    }
    toast.info(`Selected ${sug.title} for your journey.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Trip name is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await tripsService.create({
        name: name.trim(),
        description: `Plan exploring ${selectedPlace || 'curated destinations'}`,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        total_budget: totalBudget ? parseFloat(totalBudget) : undefined,
        currency,
        is_public: true,
      });

      const newTrip = res.data?.trip;

      // If user selected a city, try to add it as first stop
      const matchedCity = citiesList.find((c) => selectedPlace.toLowerCase().includes(c.name.toLowerCase()));
      if (matchedCity && newTrip?.id) {
        try {
          await tripsService.addStop(newTrip.id, {
            city_id: matchedCity.id,
            stop_order: 1,
          });
        } catch { /* ignore */ }
      }

      toast.success(`Journey "${newTrip?.name || name}" initiated.`);
      navigate(`/trips/${newTrip?.id || ''}`);
    } catch (err) {
      setError(formatErrorMessage(err, 'Failed to create journey. Please check your inputs and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-content max-w-4xl mx-auto space-y-10">
      {/* ── Screen 4: Plan a new trip Form ─────────────────────────── */}
      <div className="surface p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <span className="text-label text-[10px] block mb-1">CREATE A NEW TRIP (SCREEN 4)</span>
          <h2 className="font-display text-3xl text-ink">Plan a new trip</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Set your travel dates, place, and budget parameters.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Trip Title / Journey Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer in Europe"
              className="input-field font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="input-group">
              <label className="input-label">Start Date:</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            {/* Select a Place */}
            <div className="input-group">
              <label className="input-label">Select a Place :</label>
              <input
                type="text"
                required
                value={selectedPlace}
                onChange={(e) => setSelectedPlace(e.target.value)}
                placeholder="e.g. Paris, France or Tokyo, Japan"
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* End Date */}
            <div className="input-group">
              <label className="input-label">End Date:</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            {/* Budget */}
            <div className="input-group">
              <label className="input-label">Estimated Budget:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="3500"
                  className="input-field font-mono flex-1"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field !w-24 font-mono text-xs"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-terracotta !py-3 !px-6 shadow-xs"
            >
              {loading ? 'Initializing...' : (
                <>
                  Create Journey Canvas <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Screen 4: Suggestion for Places to Visit/Activities to perform ── */}
      <section className="space-y-4">
        <div className="border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">
            Suggestion for Places to Visit/Activities to perform
          </h3>
          <p className="text-xs text-ink-muted font-light">
            Click any suggestion below to quickly populate your trip itinerary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectSuggestion(item)}
              className="surface overflow-hidden group cursor-pointer hover:border-ink hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-36 overflow-hidden bg-paper-warm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 text-[9px] font-mono uppercase tracking-wider bg-black/40 backdrop-blur-xs text-white px-2 py-0.5 rounded-xs">
                  {item.category}
                </span>
                <h4 className="absolute bottom-2 left-3 right-3 text-white font-display text-lg leading-tight">
                  {item.title}
                </h4>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-ink-muted">{item.subtitle}</span>
                <span className="text-xs text-terracotta font-semibold group-hover:underline">
                  + Select
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
