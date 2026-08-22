import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersService } from '../services/users';
import { tripsService } from '../services/trips';
import { formatDateRange } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import {
  User,
  Camera,
  Check,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);

  // Trips lists
  const [preplannedTrips, setPreplannedTrips] = useState([]);
  const [previousTrips, setPreviousTrips] = useState([]);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(user.first_name || parts[0] || '');
      setLastName(user.last_name || parts.slice(1).join(' ') || '');
      setPhoneNumber(user.phone || '');
      setCity(user.city || '');
      setCountry(user.country || '');
      setAdditionalInfo(user.additional_info || '');
      setProfilePhoto(user.profile_photo || '');
    }
    loadUserTrips();
  }, [user]);

  const loadUserTrips = async () => {
    try {
      const res = await tripsService.list({ limit: 50 });
      const all = res.data?.trips || [];
      const now = new Date();

      const preplanned = [];
      const previous = [];

      all.forEach((t) => {
        const start = t.start_date ? new Date(t.start_date) : null;
        if (!start || start >= now) {
          preplanned.push(t);
        } else {
          previous.push(t);
        }
      });

      setPreplannedTrips(preplanned);
      setPreviousTrips(previous);
    } catch { /* ignore */ }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || user.name;
      const res = await usersService.updateProfile({
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phoneNumber.trim(),
        city: city.trim(),
        country: country.trim(),
        additional_info: additionalInfo.trim(),
        profile_photo: profilePhoto || undefined,
      });

      const updated = res.data?.user;
      updateUser(updated || {
        ...user,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        city,
        country,
        additional_info: additionalInfo,
        profile_photo: profilePhoto,
      });

      toast.success('User profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-wide space-y-12">
      {/* ── Screen 7: Top User Details & Edit Card ─────────────────── */}
      <div className="surface p-6 md:p-10 shadow-sm space-y-8">
        <div>
          <span className="text-label text-[10px] block mb-1">USER PROFILE PAGES (SCREEN 7)</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink">User Profile & Passport</h1>
          <p className="text-xs text-ink-muted mt-1 font-light">
            User Details with appropriate controls to edit your information.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-warm-gray-lighter pb-6">
            {/* Image of the User circular avatar */}
            <label className="cursor-pointer group relative shrink-0">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-ink/40 bg-paper-warm overflow-hidden flex flex-col items-center justify-center text-ink-subtle group-hover:border-terracotta transition-colors shadow-xs">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <User size={40} className="text-ink-muted mb-1 group-hover:text-terracotta transition-colors" />
                    <span className="text-[10px] font-mono uppercase">Image of User</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>

            {/* Quick summary */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="font-display text-2xl text-ink">{user?.name}</h3>
              <p className="text-xs text-ink-muted font-mono">{user?.email}</p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <span className="travel-stamp text-[9px]">{user?.role?.toUpperCase() || 'USER'}</span>
                {city && country && (
                  <span className="coordinates text-[10px]">{city}, {country}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields: First Name, Last Name, Phone, City, Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="input-field bg-paper-warm opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555-0199"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Additional Information / Bio</label>
            <textarea
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Travel interests, favorite regions, bio..."
              className="input-field text-sm"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="btn btn-terracotta">
              <Check size={14} />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Screen 7: Preplanned Trips (Grid with View buttons) ────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">Preplanned Trips</h3>
          <span className="font-mono text-xs text-ink-subtle">[{preplannedTrips.length}]</span>
        </div>

        {preplannedTrips.length === 0 ? (
          <div className="surface p-6 text-center text-xs text-ink-subtle italic">
            No preplanned trips found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preplannedTrips.map((trip) => (
              <div key={trip.id} className="surface p-4 flex flex-col justify-between hover:border-ink transition-colors">
                <div>
                  <span className="text-label text-[9px] block text-terracotta mb-1">UPCOMING</span>
                  <h4 className="font-display text-xl text-ink leading-tight">{trip.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-ink-muted mt-2 font-light">
                    <Calendar size={12} className="text-ink-subtle" />
                    <span>{formatDateRange(trip.start_date, trip.end_date) || 'Flexible dates'}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-warm-gray-lighter flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink">
                    {formatCurrency(trip.total_budget || 0, trip.currency)}
                  </span>
                  <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-secondary no-underline">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Screen 7: Previous Trips (Grid with View buttons) ───────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-warm-gray-lighter pb-2">
          <h3 className="font-display text-2xl text-ink">Previous Trips</h3>
          <span className="font-mono text-xs text-ink-subtle">[{previousTrips.length}]</span>
        </div>

        {previousTrips.length === 0 ? (
          <div className="surface p-6 text-center text-xs text-ink-subtle italic">
            No completed trips recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousTrips.map((trip) => (
              <div key={trip.id} className="surface p-4 flex flex-col justify-between opacity-80 hover:opacity-100 hover:border-ink transition-colors">
                <div>
                  <span className="text-label text-[9px] block text-ink-subtle mb-1">PAST TRIP</span>
                  <h4 className="font-display text-xl text-ink leading-tight">{trip.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-ink-muted mt-2 font-light">
                    <Calendar size={12} className="text-ink-subtle" />
                    <span>{formatDateRange(trip.start_date, trip.end_date) || 'Completed'}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-warm-gray-lighter flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink">
                    {formatCurrency(trip.total_budget || 0, trip.currency)}
                  </span>
                  <Link to={`/trips/${trip.id}`} className="btn btn-sm btn-secondary no-underline">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
