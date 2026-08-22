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
  Edit2,
  Layers,
  ArrowRight,
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

  // View switch: 'sections' (Screen 5 wireframe) | 'canvas' (Route Visualizer)
  const [viewMode, setViewMode] = useState('sections');

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

  const handleAddStop = async (city) => {
    try {
      const nextOrder = stops.length + 1;
      await tripsService.addStop(tripId, {
        city_id: city.id,
        stop_order: nextOrder,
      });
      toast.success(`${city.name} added as new section.`);
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to add section.');
    }
  };

  const handleRemoveStop = async (stopId) => {
    if (!window.confirm('Remove this section from your itinerary?')) return;
    try {
      await tripsService.deleteStop(tripId, stopId);
      toast.success('Section removed.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to remove section.');
    }
  };

  const handleReorderStops = async (orderedIds) => {
    try {
      await tripsService.reorderStops(tripId, orderedIds);
      toast.success('Sections reordered.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder sections.');
    }
  };

  const handleOpenActivityDiscovery = (stop) => {
    setActiveStopForActivity(stop);
    setIsActivityDiscoveryOpen(true);
  };

  const handleAddActivity = async (stopId, activity) => {
    try {
      await tripsService.addActivity(tripId, stopId, {
        activity_id: activity.id,
        estimated_cost: activity.cost || undefined,
      });
      toast.success(`"${activity.name}" added to section.`);
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to add activity.');
    }
  };

  const handleRemoveActivity = async (stopId, activityId) => {
    try {
      await tripsService.deleteActivity(tripId, stopId, activityId);
      toast.success('Activity removed.');
      loadItinerary();
    } catch (err) {
      toast.error(err.message || 'Failed to remove activity.');
    }
  };

  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    try {
      const res = await shareService.get(tripId);
      setShareData(res.data?.share || null);
    } catch {
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
      {/* ── Top Bar / Header ──────────────────────────────────────── */}
      <div className="surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-label text-[10px] block mb-1">BUILD ITENARY SCREEN (SCREEN 5)</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">{trip.name}</h1>
          <div className="flex items-center gap-4 text-xs text-ink-muted mt-2 font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-terracotta" />
              {formatDateRange(trip.start_date, trip.end_date) || 'Flexible dates'}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={13} className="text-olive" />
              Budget: {formatCurrency(trip.total_budget || 0, trip.currency)}
            </span>
          </div>
        </div>

        {/* View mode toggle & quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-paper-warm border border-warm-gray-lighter rounded-sm text-xs font-mono">
            <button
              onClick={() => setViewMode('sections')}
              className={`px-3 py-1.5 rounded-xs font-bold transition-all ${
                viewMode === 'sections' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              SECTIONS (SCREEN 5)
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 rounded-xs font-bold transition-all ${
                viewMode === 'canvas' ? 'bg-ink text-paper shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              JOURNEY CANVAS
            </button>
          </div>

          <Link
            to={`/trips/${trip.id}/timeline`}
            className="btn btn-secondary btn-sm text-xs no-underline"
          >
            <Clock size={14} /> Timeline View (Screen 9)
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

      {/* ── Screen 5: Multiple Sections List View ─────────────────── */}
      {viewMode === 'sections' ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {stops.length === 0 ? (
            <div className="surface p-12 text-center border-dashed border-2 border-warm-gray-lighter space-y-4">
              <h3 className="font-display text-2xl text-ink">No Sections Added Yet</h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto font-light">
                Click "+ Add another Section" below to create travel sections, hotels, or activity blocks.
              </p>
              <button
                onClick={() => setIsCityDiscoveryOpen(true)}
                className="btn btn-terracotta"
              >
                <Plus size={16} /> + Add another Section
              </button>
            </div>
          ) : (
            stops.map((stop, index) => {
              const activities = stop.activities || [];
              const stopBudget = activities.reduce((acc, a) => acc + parseFloat(a.estimated_cost || a.activity?.cost || 0), 0);

              return (
                <div key={stop.id} className="surface p-6 space-y-4 shadow-sm border-2 hover:border-ink transition-colors">
                  <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-3">
                    <h3 className="font-display text-2xl text-ink">
                      Section {index + 1}: {stop.city?.name || `Destination ${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenActivityDiscovery(stop)}
                        className="btn btn-secondary btn-sm text-xs"
                      >
                        <Plus size={13} /> Add Activity
                      </button>
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        className="btn-icon !w-7 !h-7 text-ink-subtle hover:text-danger"
                        title="Delete Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted font-light leading-relaxed">
                    {stop.city?.description ||
                      'All the necessary information about this section. This can be anything like travel section, hotel or any other activity.'}
                  </p>

                  {/* Date Range & Budget of this section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-paper-warm rounded-sm border border-warm-gray-lighter">
                      <span className="text-label text-[9px] block text-ink-subtle">DATE RANGE</span>
                      <span className="font-mono text-xs font-semibold text-ink">
                        {formatDateRange(stop.start_date, stop.end_date) || 'Date Range: xxx to yyy'}
                      </span>
                    </div>

                    <div className="p-3 bg-paper-warm rounded-sm border border-warm-gray-lighter">
                      <span className="text-label text-[9px] block text-ink-subtle">BUDGET OF THIS SECTION</span>
                      <span className="font-mono text-xs font-semibold text-ink">
                        {formatCurrency(stopBudget, trip.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Activities inside this section */}
                  {activities.length > 0 && (
                    <div className="pt-3 border-t border-warm-gray-lighter space-y-2">
                      <span className="text-label text-[10px]">SECTION ACTIVITIES & EXPERIENCES</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activities.map((act) => (
                          <div key={act.id} className="p-2.5 bg-white border border-warm-gray-lighter rounded-sm flex items-center justify-between text-xs">
                            <span className="font-medium text-ink truncate mr-2">{act.activity?.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold">
                                {formatCurrency(act.estimated_cost || act.activity?.cost || 0, trip.currency)}
                              </span>
                              <button
                                onClick={() => handleRemoveActivity(stop.id, act.id)}
                                className="text-ink-subtle hover:text-danger"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* + Add another Section CTA Button as required by wireframe Screen 5 */}
          <div className="text-center pt-4">
            <button
              onClick={() => setIsCityDiscoveryOpen(true)}
              className="btn btn-terracotta !px-8 !py-3.5 shadow-sm text-sm"
            >
              <Plus size={18} /> + Add another Section
            </button>
          </div>
        </div>
      ) : (
        /* Journey Canvas Route Visualizer */
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

          <div className="surface p-5 space-y-4 h-fit">
            <h3 className="font-display text-lg text-ink">Itinerary Metrics</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-warm-gray-lighter">
                <span className="text-ink-subtle">Sections Count</span>
                <span className="font-bold text-ink">{stops.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-gray-lighter">
                <span className="text-ink-subtle">Total Budget</span>
                <span className="font-bold text-ink">{formatCurrency(trip.total_budget || 0, trip.currency)}</span>
              </div>
            </div>
            <button
              onClick={() => setIsCityDiscoveryOpen(true)}
              className="btn btn-terracotta w-full justify-center text-xs !py-2.5"
            >
              <Plus size={14} /> + Add another Section
            </button>
          </div>
        </div>
      )}

      {/* Discovery Drawers */}
      <CityDiscovery
        isOpen={isCityDiscoveryOpen}
        onClose={() => setIsCityDiscoveryOpen(false)}
        onSelectCity={handleAddStop}
        existingCityIds={stops.map((s) => s.city_id)}
      />

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
            Share this itinerary in an editorial digital magazine format.
          </p>
          {shareData?.public_token && (
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
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
