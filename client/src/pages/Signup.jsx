import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Camera, User, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { formatErrorMessage } from '../utils/formatError';

/* ── High-quality destination images for the left panel ────── */
const SIGNUP_HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=90',
    city: 'Kyoto, Japan',
    quote: 'To travel is to live — embark on journeys that linger in memory forever.',
  },
  {
    src: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90',
    city: 'Paris, France',
    quote: 'Design your own itinerary across world-famous capitals and hidden gems.',
  },
  {
    src: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=90',
    city: 'Sydney, Australia',
    quote: 'Track budgets, discover regional wonders, and connect with global travelers.',
  },
];

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slide] = useState(() => Math.floor(Math.random() * SIGNUP_HERO_SLIDES.length));

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const hero = SIGNUP_HERO_SLIDES[slide];

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

  const fillDemo = (fName, lName, mail, phone, cty, ctry, info) => {
    setFirstName(fName);
    setLastName(lName);
    setEmail(mail);
    setPhoneNumber(phone);
    setCity(cty);
    setCountry(ctry);
    setPassword('password123');
    setAdditionalInfo(info);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Explorer';
      await signup({
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        phone: phoneNumber.trim(),
        city: city.trim(),
        country: country.trim(),
        additional_info: additionalInfo.trim(),
        profile_photo: profilePhoto || undefined,
      });

      toast.success('Registration successful. Welcome to GlobeTrotter!');
      navigate('/');
    } catch (err) {
      setError(formatErrorMessage(err, 'Unable to create account. Please check your information and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-ink overflow-hidden">

      {/* ── LEFT: High-Quality Destination Image with High-Contrast Overlay ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-between p-10 bg-ink">
        {/* Background image with calibrated opacity */}
        <img
          src={hero.src}
          alt={hero.city}
          className="absolute inset-0 w-full h-full object-cover opacity-45 transition-transform duration-[20000ms] ease-linear scale-110 animate-ken-burns"
        />
        {/* Multi-layer dark contrast gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40" />

        {/* Top Header Bar with high-contrast pills */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-mono tracking-widest shadow-md">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            GLOBETROTTER
          </div>
          <div className="bg-black/60 backdrop-blur-md text-white/80 font-mono text-[11px] px-3 py-1 rounded-full border border-white/10 tracking-wider">
            35.6762°N · 139.6503°E
          </div>
        </div>

        {/* Frosted High-Contrast Editorial Card */}
        <div className="relative z-10 max-w-md bg-ink/85 backdrop-blur-md border border-white/15 p-8 rounded-xl shadow-2xl space-y-4 animate-slide-up">
          <span className="travel-stamp text-terracotta border-terracotta bg-terracotta/15 text-[10px] font-bold px-2.5 py-1 rounded-xs inline-block animate-stamp">
            JOURNEY CANVAS · REGISTER USERS
          </span>

          <h2 className="font-display text-3xl xl:text-4xl text-white leading-snug drop-shadow-sm">
            {hero.quote}
          </h2>

          <div className="flex items-center gap-3 pt-2 border-t border-white/15">
            <span className="text-terracotta-light font-mono text-xs font-semibold uppercase tracking-wider">
              Featured Destination:
            </span>
            <span className="text-white font-medium text-sm">{hero.city}</span>
          </div>

          {/* Slide indicator dots */}
          <div className="flex gap-2 pt-2">
            {SIGNUP_HERO_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-8 bg-terracotta' : 'w-2.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Registration Form ─────────────────────────── */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center bg-paper min-h-screen py-10 px-6 sm:px-10 overflow-y-auto">
        <div className="w-full max-w-xl animate-auth-enter">

          {/* Header & Avatar Upload Circle */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-warm-gray-lighter">
            <label className="cursor-pointer group relative shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-terracotta/50 bg-paper-warm overflow-hidden flex flex-col items-center justify-center text-ink-subtle group-hover:border-terracotta transition-all shadow-xs hero-ring">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={28} className="text-terracotta mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">Photo</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            <div className="text-center sm:text-left">
              <span className="travel-stamp text-terracotta text-[10px] animate-stamp inline-block mb-1">
                JOURNEY CANVAS · PASSPORT CREATION
              </span>
              <h2 className="font-display text-3xl text-ink">Register Users</h2>
              <p className="text-xs text-ink-muted mt-1 font-light">
                Fill in your explorer details to initialize your travel passport.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-danger-muted text-danger text-xs p-3.5 rounded-sm animate-fade-in border border-danger/20">
              {error}
            </div>
          )}

          {/* Quick Pre-fill Demo buttons */}
          <div className="mb-6 p-3 bg-paper-warm rounded border border-warm-gray-lighter flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase text-ink-subtle flex items-center gap-1.5">
              <Sparkles size={13} className="text-terracotta" /> Quick fill demo:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('Diana', 'Prince', 'diana@example.com', '+1 555-0199', 'Themyscira', 'Greece', 'Loves Mediterranean coastal hikes and ancient temples.')}
                className="px-2.5 py-1 text-xs border border-warm-gray-lighter hover:border-terracotta bg-paper rounded text-ink transition-colors font-medium"
              >
                Diana (Explorer)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('Elena', 'Rostova', 'elena@example.com', '+44 20 7946 0912', 'London', 'United Kingdom', 'Solo traveler passionate about museums, cafes, and rail journeys.')}
                className="px-2.5 py-1 text-xs border border-warm-gray-lighter hover:border-terracotta bg-paper rounded text-ink transition-colors font-medium"
              >
                Elena (Backpacker)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 form-stagger">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="input-field input-glow"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="input-field input-glow"
                />
              </div>
            </div>

            {/* Row 2: Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field input-glow"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="input-field input-glow"
                />
              </div>
            </div>

            {/* Row 3: City & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                  className="input-field input-glow"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  className="input-field input-glow"
                />
              </div>
            </div>

            {/* Row 4: Password */}
            <div className="input-group">
              <label className="input-label">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field font-mono input-glow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Row 5: Additional Information */}
            <div className="input-group">
              <label className="input-label">Additional Information ....</label>
              <textarea
                rows={2}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Travel styles, preferred regions, bucket-list destinations, or interests..."
                className="input-field text-sm input-glow"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-terracotta w-full justify-center !py-3.5 mt-4 shadow-sm btn-ripple"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  Creating Passport
                  <span className="dot-trail"><span /><span /><span /></span>
                </span>
              ) : (
                <>
                  Register Users <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center text-sm text-ink-muted">
            Already registered?{' '}
            <Link to="/login" className="text-terracotta font-semibold hover:underline">
              Login here →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
