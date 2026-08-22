import { useState, useEffect } from 'react';
import { adminService } from '../services/admin';
import PageHeader from '../components/PageHeader';
import SectionLabel from '../components/SectionLabel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateShort } from '../utils/formatDate';
import {
  Users,
  Map,
  Compass,
  DollarSign,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react';

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, usersRes, tripsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.listUsers({ limit: 15 }),
        adminService.listTrips({ limit: 15 }),
      ]);

      setAnalytics(analyticsRes.data?.analytics || null);
      setUsersList(usersRes.data?.users || []);
      setTripsList(tripsRes.data?.trips || []);
    } catch (err) {
      setError(err.message || 'Access restricted. Administrator privileges required.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page page-content">
        <LoadingState lines={8} />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="page page-content">
        <ErrorState message={error || 'Administrator access required.'} onRetry={loadAdminData} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-10">
      <PageHeader
        stamp="ADMINISTRATION / CONSOLE"
        coordinates="PLATFORM CONTROL CENTER"
        title="Command & Analytics"
        subtitle="Platform-wide metrics, explorer registry, expedition records, and ecosystem health."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="surface p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-[10px]">TOTAL USERS</span>
            <Users size={16} className="text-terracotta" />
          </div>
          <div className="text-display text-3xl text-ink font-bold">
            {analytics.total_users || 0}
          </div>
          <span className="text-xs text-ink-subtle">Registered explorers</span>
        </div>

        <div className="surface p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-[10px]">TOTAL EXPEDITIONS</span>
            <Map size={16} className="text-olive" />
          </div>
          <div className="text-display text-3xl text-ink font-bold">
            {analytics.total_trips || 0}
          </div>
          <span className="text-xs text-ink-subtle">
            {analytics.public_trips || 0} public stories
          </span>
        </div>

        <div className="surface p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-[10px]">DESTINATIONS PLOTTED</span>
            <Compass size={16} className="text-terracotta" />
          </div>
          <div className="text-display text-3xl text-ink font-bold">
            {analytics.total_stops || 0}
          </div>
          <span className="text-xs text-ink-subtle">City stops mapped</span>
        </div>

        <div className="surface p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label text-[10px]">EXPENSES LOGGED</span>
            <DollarSign size={16} className="text-olive" />
          </div>
          <div className="text-display text-3xl text-ink font-bold">
            {analytics.total_expenses || 0}
          </div>
          <span className="text-xs text-ink-subtle">Total transaction records</span>
        </div>
      </div>

      {/* Explorer Registry Table */}
      <div className="surface p-6">
        <SectionLabel label="EXPLORER REGISTRY" count={usersList.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-gray-lighter text-label text-[10px]">
                <th className="pb-2">NAME</th>
                <th className="pb-2">EMAIL</th>
                <th className="pb-2">ROLE</th>
                <th className="pb-2">LANGUAGE</th>
                <th className="pb-2 text-right">JOINED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray-lighter">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-paper-warm/50 transition-colors">
                  <td className="py-3 font-medium text-ink">{u.name}</td>
                  <td className="py-3 font-mono text-ink-muted">{u.email}</td>
                  <td className="py-3 font-mono">
                    <span
                      className={`travel-stamp text-[9px] py-0 ${
                        u.role === 'admin' ? 'travel-stamp--olive' : 'travel-stamp--ink'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-mono uppercase text-ink-subtle">{u.language}</td>
                  <td className="py-3 font-mono text-ink-subtle text-right">
                    {formatDateShort(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Trips Ledger Table */}
      <div className="surface p-6">
        <SectionLabel label="PLATFORM-WIDE EXPEDITIONS" count={tripsList.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-gray-lighter text-label text-[10px]">
                <th className="pb-2">EXPEDITION</th>
                <th className="pb-2">OWNER EMAIL</th>
                <th className="pb-2">DATES</th>
                <th className="pb-2">BUDGET</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-gray-lighter">
              {tripsList.map((t) => (
                <tr key={t.id} className="hover:bg-paper-warm/50 transition-colors">
                  <td className="py-3 font-medium text-ink">{t.name}</td>
                  <td className="py-3 font-mono text-ink-muted">{t.user_email || t.user_id?.slice(0, 8)}</td>
                  <td className="py-3 font-mono text-ink-subtle">
                    {t.start_date ? `${formatDateShort(t.start_date)} - ${formatDateShort(t.end_date)}` : 'Flexible'}
                  </td>
                  <td className="py-3 font-mono font-bold text-ink">
                    {t.total_budget ? formatCurrency(t.total_budget, t.currency) : '—'}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`travel-stamp text-[9px] py-0 ${
                        t.is_public ? 'travel-stamp--olive' : 'travel-stamp--ink'
                      }`}
                    >
                      {t.is_public ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
