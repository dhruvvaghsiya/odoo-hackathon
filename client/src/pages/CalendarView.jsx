import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripsService } from '../services/trips';
import LoadingState from '../components/LoadingState';
import { formatDateShort } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // Default June 2026
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screen 11 Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('month');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date_asc');
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await tripsService.list({ limit: 100 });
      setTrips(res.data?.trips || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ dayNumber: null, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    daysArray.push({ dayNumber: d, isCurrentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  // Find trips that intersect on each date
  const getTripsForDate = (dateStr) => {
    if (!dateStr) return [];
    return trips.filter((t) => {
      if (!t.start_date) return false;
      const start = t.start_date.substring(0, 10);
      const end = (t.end_date || t.start_date).substring(0, 10);
      return dateStr >= start && dateStr <= end;
    });
  };

  const filteredTrips = trips.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page page-wide space-y-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="border-b border-warm-gray-lighter pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-label text-[10px] block mb-1">
            CALENDAR VIEW (SCREEN 11)
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-ink">Calendar View</h1>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Interactive chronological calendar of scheduled journeys and expeditions.
          </p>
        </div>

        <Link to="/trips/new" className="btn btn-terracotta btn-sm no-underline shadow-xs">
          + Plan a Trip
        </Link>
      </div>

      {/* ── Screen 11: Search bar + Group by + Filter + Sort by Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ..... (search scheduled trips)"
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
              <option value="month">Group by: Month</option>
              <option value="destination">Group by: Place</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All Trips</option>
              <option value="public">Filter: Public</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-ink-subtle" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="date_asc">Sort by: Date</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 11: Calendar Grid ───────────────────────────────── */}
      <div className="surface p-6 md:p-8 shadow-sm space-y-6 max-w-5xl mx-auto">
        {/* Month Navigation Banner (← Month Year →) */}
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-4">
          <button
            onClick={handlePrevMonth}
            className="btn-icon hover:bg-paper-warm"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="font-display text-2xl md:text-3xl text-ink font-bold">
            {MONTH_NAMES[month]} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="btn-icon hover:bg-paper-warm"
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-label text-[11px] text-ink-muted border-b border-warm-gray-lighter pb-2 font-mono">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {daysArray.map((cell, idx) => {
            const dateTrips = cell.dateStr ? getTripsForDate(cell.dateStr) : [];
            const isToday = cell.isCurrentMonth &&
              new Date().toISOString().substring(0, 10) === cell.dateStr;

            return (
              <div
                key={idx}
                className={`min-h-[85px] md:min-h-[110px] p-1.5 md:p-2 border rounded-sm transition-colors flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? 'bg-paper-dark/30 border-transparent opacity-30'
                    : isToday
                    ? 'bg-terracotta/5 border-terracotta shadow-xs'
                    : 'bg-white border-warm-gray-lighter hover:border-ink'
                }`}
              >
                {cell.dayNumber && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday ? 'text-terracotta' : 'text-ink'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dateTrips.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    )}
                  </div>
                )}

                {/* Trip Badges inside date cell */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-[60px]">
                  {dateTrips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="p-1 rounded-xs bg-ink text-paper text-[9px] font-mono uppercase tracking-wider font-semibold cursor-pointer truncate hover:bg-terracotta transition-colors"
                      title={`${trip.name} (${formatCurrency(trip.total_budget || 0, trip.currency)})`}
                    >
                      {trip.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
