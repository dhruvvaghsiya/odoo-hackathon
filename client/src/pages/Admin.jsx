import { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import { citiesService } from '../services/cities';
import { activitiesService } from '../services/activities';
import { useToast } from '../context/ToastContext';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import { getCityImage } from '../utils/constants';
import { formatErrorMessage } from '../utils/formatError';
import {
  Users,
  MapPin,
  Compass,
  TrendingUp,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  Shield,
  UserCheck,
  Eye,
  Trash2,
  Edit,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#C4654A', '#5B7553', '#1B2432', '#C4954A', '#7A9470', '#D4806A'];

export default function Admin() {
  const toast = useToast();

  // Screen 12 Active Tab: 'users' | 'cities' | 'activities' | 'analytics'
  const [activeTab, setActiveTab] = useState('analytics');

  // Screen 12 Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('none');
  const [filterOption, setFilterOption] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected User for viewing trips
  const [selectedUserForTrips, setSelectedUserForTrips] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, citiesRes, activitiesRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.listUsers({ limit: 50 }),
        citiesService.popular({ limit: 20 }),
        activitiesService.popular({ limit: 20 }),
      ]);

      setAnalytics(analyticsRes.data?.analytics || null);
      setUsers(usersRes.data?.users || []);
      setPopularCities(citiesRes.data?.cities || []);
      setPopularActivities(activitiesRes.data?.activities || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserTrips = async (user) => {
    setSelectedUserForTrips(user);
    setIsTripsModalOpen(true);
    try {
      const res = await adminService.listTrips({ user_id: user.id });
      setUserTrips(res.data?.trips || []);
    } catch {
      setUserTrips([]);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role updated to ${newRole.toUpperCase()}.`);
    } catch (err) {
      toast.error(formatErrorMessage(err, 'Failed to update user role.'));
    }
  };

  // Mock time-series data for trends and analytics
  const trendData = [
    { month: 'Jan', trips: 14, users: 28, budget: 32000 },
    { month: 'Feb', trips: 19, users: 35, budget: 45000 },
    { month: 'Mar', trips: 28, users: 52, budget: 62000 },
    { month: 'Apr', trips: 36, users: 68, budget: 88000 },
    { month: 'May', trips: 48, users: 95, budget: 120000 },
    { month: 'Jun', trips: 62, users: 130, budget: 165000 },
  ];

  const categoryData = analytics?.expense_by_category || [
    { category: 'flights', total: 42000, count: 18 },
    { category: 'hotels', total: 38000, count: 24 },
    { category: 'activities', total: 21000, count: 42 },
    { category: 'food', total: 18000, count: 65 },
    { category: 'transport', total: 12000, count: 30 },
  ];

  if (loading) {
    return (
      <div className="page page-wide">
        <LoadingState lines={10} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="border-b border-warm-gray-lighter pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="travel-stamp text-terracotta text-[10px]">
            ADMIN PANEL SCREEN / SCREEN 12
          </span>
          <span className="coordinates text-[10px]">PLATFORM GOVERNANCE & TELEMETRY</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink">Admin Control Center</h1>
      </div>

      {/* ── Screen 12: Search bar + Group by + Filter + Sort by Controls ── */}
      <div className="surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search bar ..... (search users, cities, or activities)"
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
              <option value="none">Group by: None</option>
              <option value="role">Group by: Role</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Filter size={14} className="text-ink-subtle" />
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="all">Filter: All Records</option>
              <option value="admin">Filter: Admins</option>
              <option value="user">Filter: Users</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-ink-subtle" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !px-2 text-xs font-mono"
            >
              <option value="default">Sort by: Default</option>
              <option value="name">Sort by: Name</option>
              <option value="trips">Sort by: Trips Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Screen 12: 4 Navigation Tabs ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`p-3 rounded-sm border font-display text-sm text-center transition-all ${
            activeTab === 'users'
              ? 'bg-ink text-paper border-ink shadow-sm'
              : 'surface text-ink hover:border-ink'
          }`}
        >
          Manage Users
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`p-3 rounded-sm border font-display text-sm text-center transition-all ${
            activeTab === 'cities'
              ? 'bg-ink text-paper border-ink shadow-sm'
              : 'surface text-ink hover:border-ink'
          }`}
        >
          Popular Cities
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`p-3 rounded-sm border font-display text-sm text-center transition-all ${
            activeTab === 'activities'
              ? 'bg-ink text-paper border-ink shadow-sm'
              : 'surface text-ink hover:border-ink'
          }`}
        >
          Popular Activities
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`p-3 rounded-sm border font-display text-sm text-center transition-all ${
            activeTab === 'analytics'
              ? 'bg-ink text-paper border-ink shadow-sm'
              : 'surface text-ink hover:border-ink'
          }`}
        >
          User Trends and Analytics
        </button>
      </div>

      {/* ── Tab 1: Manage Users ────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Wireframe Requirement Explanatory Box */}
          <div className="surface p-4 bg-paper-warm border border-warm-gray-lighter space-y-1">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Manage User Section
            </h4>
            <p className="text-xs text-ink-muted font-light leading-relaxed">
              This Section is responsible for managing the users and their actions. This section will give the admin the access to view all the trips made by the user. Also other functionalities are welcome...
            </p>
          </div>

          <div className="surface overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-warm-gray-lighter bg-paper-warm text-label text-[10px] text-ink-subtle">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Contact / Location</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-gray-lighter">
                  {users
                    .filter((u) => {
                      const matches = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesFilter = filterOption === 'all' || u.role === filterOption;
                      return matches && matchesFilter;
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-paper-warm/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta font-bold flex items-center justify-center text-xs">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{u.name}</div>
                              <div className="text-[11px] text-ink-muted font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-ink-muted">
                          {u.city || u.country ? (
                            <span>{u.city ? `${u.city}, ` : ''}{u.country}</span>
                          ) : (
                            <span className="italic text-ink-subtle">Not specified</span>
                          )}
                          {u.phone && <div className="text-[10px] font-mono">{u.phone}</div>}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            className={`badge ${
                              u.role === 'admin' ? 'badge--terracotta' : 'badge--olive'
                            } cursor-pointer`}
                            title="Click to toggle role"
                          >
                            {u.role.toUpperCase()}
                          </button>
                        </td>

                        <td className="p-3.5 font-mono text-ink-subtle">
                          {formatDateShort(u.created_at)}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleViewUserTrips(u)}
                            className="btn btn-sm btn-secondary text-xs"
                          >
                            <Eye size={12} /> View Trips
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Popular Cities ──────────────────────────────────── */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          {/* Wireframe Requirement Explanatory Box */}
          <div className="surface p-4 bg-paper-warm border border-warm-gray-lighter space-y-1">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Popular Cities Section
            </h4>
            <p className="text-xs text-ink-muted font-light leading-relaxed">
              Popular cities: Lists all the popular cities where the users are visiting based on the current user trends.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCities
              .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.country.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((city, idx) => (
                <div key={city.id} className="surface overflow-hidden hover:border-ink transition-colors flex flex-col justify-between">
                  <div className="relative h-40 overflow-hidden bg-paper-warm">
                    <img
                      src={getCityImage(city)}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-xs">
                      Rank #{idx + 1}
                    </span>
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <h4 className="font-display text-xl leading-tight">{city.name}</h4>
                      <span className="text-xs text-warm-gray-light">{city.country}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-warm-gray-lighter font-mono">
                      <span className="text-ink-subtle">Popularity Score</span>
                      <span className="font-bold text-terracotta">{city.popularity || 85} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-warm-gray-lighter font-mono">
                      <span className="text-ink-subtle">Cost Index</span>
                      <span className="font-bold text-ink">${city.cost_index || 120} / day</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Tab 3: Popular Activities ──────────────────────────────── */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Wireframe Requirement Explanatory Box */}
          <div className="surface p-4 bg-paper-warm border border-warm-gray-lighter space-y-1">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Popular Activities Section
            </h4>
            <p className="text-xs text-ink-muted font-light leading-relaxed">
              Popular Activities: List all the popular activities that the users are doing based on the current user trend data.
            </p>
          </div>

          <div className="space-y-3">
            {popularActivities
              .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((act, idx) => (
                <div key={act.id} className="surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-paper-warm flex items-center justify-center font-mono font-bold text-sm text-ink shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="travel-stamp text-[9px] py-0">{act.type}</span>
                        <span className="text-xs text-ink-subtle font-mono">{act.city_name || 'Global'}</span>
                      </div>
                      <h4 className="font-display text-xl text-ink leading-tight mt-0.5">{act.name}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center font-mono text-xs">
                    <div className="text-right">
                      <span className="text-ink-subtle block text-[10px] uppercase">Trend Score</span>
                      <span className="font-bold text-olive">{act.popularity || 90}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-ink-subtle block text-[10px] uppercase">Est. Cost</span>
                      <span className="font-bold text-ink">{formatCurrency(act.cost || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Tab 4: User Trends and Analytics ───────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Wireframe Requirement Explanatory Box */}
          <div className="surface p-4 bg-paper-warm border border-warm-gray-lighter space-y-1">
            <h4 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              User Trends and Analytics Section
            </h4>
            <p className="text-xs text-ink-muted font-light leading-relaxed">
              User trends and Analytics: This section will major focus on the providing analysis across various points and give useful information to the user.
            </p>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="surface p-4">
              <span className="text-label text-[10px] block mb-1">TOTAL USERS</span>
              <div className="font-display text-3xl text-ink">
                {analytics?.users?.total_users || users.length || 142}
              </div>
              <span className="text-[11px] text-olive font-mono flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /> +18% this month
              </span>
            </div>

            <div className="surface p-4">
              <span className="text-label text-[10px] block mb-1">TRIPS CREATED</span>
              <div className="font-display text-3xl text-ink">
                {analytics?.trips?.total_trips || 89}
              </div>
              <span className="text-[11px] text-olive font-mono flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /> +24% growth
              </span>
            </div>

            <div className="surface p-4">
              <span className="text-label text-[10px] block mb-1">TOTAL SPEND TRACKED</span>
              <div className="font-display text-3xl text-ink">
                {formatCurrency(analytics?.expenses?.total_spent || 248500)}
              </div>
              <span className="text-[11px] text-ink-subtle font-mono mt-1 block">
                Across {analytics?.expenses?.total_expenses || 340} items
              </span>
            </div>

            <div className="surface p-4">
              <span className="text-label text-[10px] block mb-1">AVG. DURATION</span>
              <div className="font-display text-3xl text-ink">
                {analytics?.trips?.avg_trip_duration_days || 7.5} Days
              </div>
              <span className="text-[11px] text-ink-subtle font-mono mt-1 block">
                Per expedition
              </span>
            </div>
          </div>

          {/* Charts Row: Line Chart (User & Trip Trends) & Donut Chart (Category Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart: User Trends Over Time */}
            <div className="surface p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
                <h4 className="font-display text-lg text-ink">User Growth & Expedition Activity</h4>
                <span className="font-mono text-xs text-ink-subtle">H1 2026</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DBD5CA" opacity={0.5} />
                    <XAxis dataKey="month" stroke="#718096" fontSize={11} />
                    <YAxis stroke="#718096" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#1B2432" strokeWidth={2.5} name="Active Users" />
                    <Line type="monotone" dataKey="trips" stroke="#C4654A" strokeWidth={2.5} name="Trips Created" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Expense Distribution */}
            <div className="surface p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
                <h4 className="font-display text-lg text-ink">Category Spend Distribution</h4>
                <span className="font-mono text-xs text-ink-subtle">GLOBAL LEDGER</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart: Budget Spend by Month */}
          <div className="surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
              <h4 className="font-display text-lg text-ink">Monthly Expedition Capital Volume</h4>
              <span className="font-mono text-xs text-ink-subtle">AGGREGATE EXPENDITURE</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DBD5CA" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#718096" fontSize={11} />
                  <YAxis stroke="#718096" fontSize={11} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="budget" fill="#5B7553" name="Total Planned Budget" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* View User Trips Modal */}
      <Modal
        isOpen={isTripsModalOpen}
        onClose={() => setIsTripsModalOpen(false)}
        title={`Expeditions by ${selectedUserForTrips?.name || 'User'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-muted">
            All journeys created by <strong className="text-ink">{selectedUserForTrips?.email}</strong>.
          </p>

          {userTrips.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-subtle italic bg-paper-warm rounded">
              This user has not created any trips yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {userTrips.map((trip) => (
                <div key={trip.id} className="p-3 bg-white border border-warm-gray-lighter rounded flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-ink">{trip.name}</h5>
                    <span className="text-ink-subtle font-mono">
                      {formatDateShort(trip.start_date)} - {formatDateShort(trip.end_date)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-ink">
                    {formatCurrency(trip.total_budget || 0, trip.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
