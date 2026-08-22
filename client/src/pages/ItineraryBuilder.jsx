import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripsService } from '../services/trips';
import { shareService } from '../services/share';
import { useToast } from '../context/ToastContext';
import JourneyRoute from '../components/JourneyRoute';
import CityDiscovery from '../components/CityDiscovery';
import ActivityDiscovery from '../components/ActivityDiscovery';
import Modal from '../components/Modal';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import {
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Clock,
  PieChart,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export default function ItineraryBuilder() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discovery Drawers state
  const [isCityDiscoveryOpen, setIsCityDiscoveryOpen] = useState(false);
  const [isActivityDiscoveryOpen, setIsActivityDiscoveryOpen] = useState(false);
  const [activeStopForActivity, setActiveStopForActivity] = useState(null);

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadItinerary();
  }, [tripId]);

  const loadItinerary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsService.getItinerary(tripId);
      setTrip(res.data?.trip || null);
      setStops(res.data?.stops || []);
      setSummary(res.data?.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load itinerary.');
    } finally {
      setLoading(false);
    }
  };

  // Add a stop to the trip
  const handleAddStop = async (city) => {
    try {
      const nextOrder = stops.length + 1;
      await tripsService.addStop(tripId, {
        city_id: city.id,
        stop_order: nextOrder,
      });
      toast.success(`${city.name} added to your route.`);
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to add stop.');
    }
  };

  // Remove a stop
  const handleRemoveStop = async (stopId) => {
    if (!window.confirm('Remove this destination and its activities from your journey?')) {
      return;
    }
    try {
      await tripsService.deleteStop(tripId, stopId);
      toast.success('Stop removed from route.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to remove stop.');
    }
  };

  // Reorder stops
  const handleReorderStops = async (orderedIds) => {
    try {
      await tripsService.reorderStops(tripId, orderedIds);
      toast.success('Journey route reordered.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder stops.');
    }
  };

  // Open activity discovery for a stop
  const handleOpenActivityDiscovery = (stop) => {
    setActiveStopForActivity(stop);
    setIsActivityDiscoveryOpen(true);
  };

  // Add activity to a stop
  const handleAddActivity = async (stopId, activity) => {
    try {
      await tripsService.addActivity(tripId, stopId, {
        activity_id: activity.id,
        estimated_cost: activity.cost || undefined,
      });
      toast.success(`"${activity.name}" added to itinerary.`);
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to add activity.');
    }
  };

  // Remove activity from a stop
  const handleRemoveActivity = async (stopId, activityId) => {
    try {
      await tripsService.deleteActivity(tripId, stopId, activityId);
      toast.success('Activity removed.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to remove activity.');
    }
  };

  // Share Management
  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    try {
      const res = await shareService.get(tripId);
      setShareData(res.data?.share || null);
    } catch {
      // If no share exists, we can create one
      try {
        const createRes = await shareService.create(tripId);
        setShareData(createRes.data?.share || null);
      } catch (e) {
        console.error('Failed to create share:', e);
      }
    }
  };

  const handleCopyShareUrl = () => {
    if (!shareData?.public_token) return;
    const url = `${window.location.origin}/trip/${shareData.public_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Public magazine link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="page page-wide">
        <LoadingState lines={8} />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="page page-content">
        <ErrorState message={error || 'Trip not found.'} onRetry={loadItinerary} />
      </div>
    );
  }

  return (
    <div className="page page-wide space-y-8">
      {/* Editorial Trip Top Navigation & Controls */}
      <div className="border-b border-warm-gray-lighter pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="travel-stamp text-terracotta bg-terracotta-muted">
                JOURNEY CANVAS
              </span>
              <span className="coordinates text-[10px]">
                {summary?.number_of_cities || 0} DESTINATIONS • {summary?.total_days || 'FLEXIBLE'} DAYS
              </span>
            </div>
            <h1 className="text-display text-3xl md:text-5xl text-ink">{trip.name}</h1>
            {trip.description && (
              <p className="text-sm text-ink-muted mt-1 font-light max-w-2xl">{trip.description}</p>
            )}
          </div>

          {/* Quick Tab & Share Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/trips/${trip.id}/timeline`}
              className="btn btn-secondary btn-sm text-xs no-underline"
            >
              <Clock size={14} /> Timeline View
            </Link>
            <Link
              to={`/trips/${trip.id}/budget`}
              className="btn btn-secondary btn-sm text-xs no-underline"
            >
              <PieChart size={14} /> Budget Journal
            </Link>
            <button
              onClick={handleOpenShare}
              className="btn btn-terracotta btn-sm text-xs"
            >
              <Share2 size={14} /> Share Story
            </button>
          </div>
        </div>

        {/* Trip Meta Overview Bar */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-warm-gray-lighter text-xs text-ink-muted">
          <div className="flex items-center gap-1.5 font-light">
            <Calendar size={13} className="text-terracotta" />
            <span>{formatDateRange(trip.start_date, trip.end_date) || 'Flexible dates'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <DollarSign size={13} className="text-olive" />
            <span>
              Target Budget: {trip.total_budget ? formatCurrency(trip.total_budget, trip.currency) : 'Unset'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-ink-subtle" />
            <span>{stops.length} Planned Stop{stops.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas View: The Signature Journey Route */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <JourneyRoute
            stops={stops}
            trip={trip}
            onOpenCityDiscovery={() => setIsCityDiscoveryOpen(true)}
            onOpenActivityDiscovery={handleOpenActivityDiscovery}
            onRemoveStop={handleRemoveStop}
            onReorderStops={handleReorderStops}
            onRemoveActivity={handleRemoveActivity}
          />
        </div>

        {/* Canvas Sidebar: Quick Inspector & Actions */}
        <div className="space-y-6">
          <div className="surface p-5 space-y-4">
            <h3 className="font-display text-lg text-ink">Journey Summary</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-warm-gray-lighter">
                <span className="text-ink-subtle">Total Destinations</span>
                <span className="font-bold text-ink">{summary?.number_of_cities || stops.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-gray-lighter">
                <span className="text-ink-subtle">Total Days</span>
                <span className="font-bold text-ink">{summary?.total_days || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-gray-lighter">
                <span className="text-ink-subtle">Currency</span>
                <span className="font-bold text-ink">{trip.currency}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCityDiscoveryOpen(true)}
              className="btn btn-terracotta w-full justify-center text-xs !py-2.5"
            >
              <Plus size={14} /> Add Next Destination
            </button>
          </div>

          {/* Tips Box */}
          <div className="p-4 bg-paper-warm rounded-sm border border-warm-gray-lighter text-xs text-ink-muted space-y-2 font-light">
            <p className="font-semibold text-ink uppercase tracking-wider text-[10px]">
              CANVAS INTERACTION TIP
            </p>
            <p>
              Use the arrow buttons next to any stop to dynamically reorder your journey route. Add activities to see them settle into each destination.
            </p>
          </div>
        </div>
      </div>

      {/* City Discovery Drawer */}
      <CityDiscovery
        isOpen={isCityDiscoveryOpen}
        onClose={() => setIsCityDiscoveryOpen(false)}
        onSelectCity={handleAddStop}
        existingCityIds={stops.map((s) => s.city_id)}
      />

      {/* Activity Discovery Drawer */}
      <ActivityDiscovery
        isOpen={isActivityDiscoveryOpen}
        onClose={() => setIsActivityDiscoveryOpen(false)}
        stop={activeStopForActivity}
        onSelectActivity={handleAddActivity}
        existingActivityIds={
          activeStopForActivity?.activities?.map((a) => a.activity_id) || []
        }
      />

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Digital Travel Story"
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-muted font-light">
            Anyone with this read-only link can view your journey in an editorial digital magazine format.
          </p>

          {shareData?.public_token ? (
            <div className="space-y-3">
              <div className="p-3 bg-paper-warm border border-warm-gray-lighter rounded-sm flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink truncate">
                  {`${window.location.origin}/trip/${shareData.public_token}`}
                </span>
                <button
                  onClick={handleCopyShareUrl}
                  className="btn btn-sm btn-secondary shrink-0"
                >
                  {copied ? <Check size={14} className="text-olive" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={`/trip/${shareData.public_token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-terracotta font-semibold hover:underline flex items-center gap-1"
                >
                  Preview Public Magazine View <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={handleOpenShare}
                className="btn btn-terracotta btn-sm"
              >
                Generate Shareable Link
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
