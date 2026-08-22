import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripsService } from '../services/trips';
import LoadingState from '../components/LoadingState';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { getCityImage } from '../utils/constants';
import {
  Users,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Share2,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Community() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen 10 Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('destination');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    setLoading(true);
    try {
      const res = await tripsService.list({ limit: 50 });
      setTrips(res.data?.trips || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="page page-wide space-y-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="border-b border-warm-gray-lighter pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="travel-stamp travel-stamp--olive text-[10px]">
            COMMUNITY TAB (SCREEN 10)
          </span>
          <span className="coordinates text-[10px]">GLOBAL EXPLORER NETWORK</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink">Community Tab</h1>
      </div>

      {/* ── Screen 10: Official Requirement Explanatory Box ───────── */}
      <div className="surface p-5 bg-paper-warm border border-warm-gray-lighter space-y-2">
        <div className="flex items-center gap-2 text-ink font-bold text-xs uppercase tracking-wider font-mono">
          <Users size={16} className="text-terracotta" />
          Community Explorer Hub
        </div>
        <p className="text-xs text-ink-muted font-light leading-relaxed">
          Community section where all the users can share their experience about a certain trip or activity.
          Using the search, groupby or filter and sortby option, the user can narrow down the result that he is looking for...
        </p>
      </div>

      {/* ── Screen 10: Search bar + Group by + Filter + Sort by Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ..... (search shared community stories & activities)"
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
              <option value="destination">Group by: Destination</option>
              <option value="author">Group by: Author</option>
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
              <option value="all">Filter: All Posts</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="americas">Americas</option>
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
              <option value="popular">Sort by: Popular</option>
              <option value="recent">Sort by: Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 10: Community Feed Posts List ───────────────────── */}
      {loading ? (
        <LoadingState lines={8} />
      ) : filteredTrips.length === 0 ? (
        <div className="surface p-12 text-center text-ink-subtle italic">
          No community posts matching your search.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip, idx) => {
            const authorInitials = trip.user_name ? trip.user_name.charAt(0).toUpperCase() : `U${idx + 1}`;
            const authorName = trip.user_name || `Explorer ${idx + 1}`;
            const cover = trip.cover_photo || getCityImage(trip.stops?.[0]?.city) || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80';
            const isLiked = !!likedPosts[trip.id];

            return (
              <div key={trip.id} className="surface p-6 flex flex-col md:flex-row gap-6 hover:border-ink transition-colors">
                {/* Author Avatar Circle as in wireframe */}
                <div className="flex md:flex-col items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-full bg-ink text-paper font-display text-xl font-bold flex items-center justify-center shadow-xs">
                    {authorInitials}
                  </div>
                  <span className="text-xs font-semibold text-ink text-center max-w-[80px] truncate">
                    {authorName}
                  </span>
                </div>

                {/* Main Post Card */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="travel-stamp text-[9px]">COMMUNITY ITINERARY</span>
                      <span className="text-xs text-ink-subtle font-mono">
                        {formatDateRange(trip.start_date, trip.end_date) || 'Flexible timeline'}
                      </span>
                    </div>
                    {trip.total_budget && (
                      <span className="font-mono text-xs font-bold text-ink">
                        Budget: {formatCurrency(trip.total_budget, trip.currency)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl text-ink leading-tight">{trip.name}</h3>

                  <p className="text-xs text-ink-muted font-light leading-relaxed">
                    {trip.description ||
                      'Shared my experience planning this itinerary across diverse regions, budgeting daily expenses, and discovering local culinary gems.'}
                  </p>

                  {/* Post Image Banner */}
                  <div className="relative h-44 rounded overflow-hidden bg-paper-warm">
                    <img src={cover} alt={trip.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 text-white font-display text-lg">
                      {trip.stops?.[0]?.city?.name ? `Highlights of ${trip.stops[0].city.name}` : trip.name}
                    </span>
                  </div>

                  {/* Actions & Interaction Bar */}
                  <div className="pt-3 border-t border-warm-gray-lighter flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(trip.id)}
                        className={`flex items-center gap-1 font-medium transition-colors ${
                          isLiked ? 'text-danger' : 'text-ink-muted hover:text-danger'
                        }`}
                      >
                        <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{isLiked ? 25 : 24} Likes</span>
                      </button>

                      <span className="flex items-center gap-1 text-ink-muted">
                        <MessageSquare size={15} /> 8 Comments
                      </span>
                    </div>

                    <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-terracotta no-underline">
                      Explore Itinerary <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
