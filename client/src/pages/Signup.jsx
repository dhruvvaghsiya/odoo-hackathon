import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Camera, User, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

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
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 md:p-12 overflow-hidden bg-ink">
      {/* Scenic Background Image — kept as-is */}
      <img
        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=85"
        alt="Travel Scenery"
        className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px] transition-transform duration-[20000ms] ease-linear scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/40 backdrop-blur-[2px]" />

      {/* Floating atmospheric decorations */}
      <div className="absolute top-10 right-12 text-white/8 font-display text-5xl pointer-events-none select-none animate-float" style={{ animationDuration: '9s' }}>🧭</div>
      <div className="absolute bottom-16 left-10 text-white/5 font-mono text-xs pointer-events-none select-none animate-fade-in" style={{ animationDelay: '0.8s' }}>35.6762°N · 139.6503°E</div>

      <div className="relative z-10 surface w-full max-w-2xl p-8 md:p-12 shadow-lg space-y-6 bg-paper/98 border border-warm-gray-light animate-auth-enter">
        {/* Photo Avatar Circle as required by wireframe Screen 2 */}
        <div className="flex flex-col items-center justify-center">
          <label className="cursor-pointer group relative">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-terracotta/40 bg-paper-warm overflow-hidden flex flex-col items-center justify-center text-ink-subtle group-hover:border-terracotta transition-colors shadow-xs hero-ring">
              {profilePhoto ? (
                <img src={profilePhoto} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={32} className="text-ink-muted mb-1 group-hover:text-terracotta transition-colors" />
                  <span className="text-[11px] font-mono uppercase tracking-wider">Photo</span>
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
          <span className="text-[10px] text-ink-subtle mt-1">Click to upload photo</span>
        </div>

        <div className="text-center">
          <span className="travel-stamp text-terracotta text-[10px] animate-stamp" style={{ animationDelay: '400ms' }}>JOURNEY CANVAS · JOIN US</span>
          <h2 className="font-display text-3xl text-ink mt-1">Begin Your Journey</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Fill in your explorer details to initialize your passport.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 form-stagger">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">First Name</label>
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
              <label className="input-label">Last Name</label>
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
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="input-field input-glow"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
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
                placeholder="City"
                className="input-field input-glow"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="input-field input-glow"
              />
            </div>
          </div>

          {/* Row 4: Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-field font-mono input-glow"
            />
          </div>

          {/* Row 5: Additional Information */}
          <div className="input-group">
            <label className="input-label">Additional Information ....</label>
            <textarea
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Additional Information, travel interests, dietary preferences..."
              className="input-field text-sm"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-terracotta w-full justify-center !py-3.5 mt-2 shadow-xs btn-ripple"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                Creating your passport
                <span className="dot-trail"><span /><span /><span /></span>
              </span>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-ink-muted font-light">
          Already registered?{' '}
          <Link to="/login" className="text-terracotta font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
