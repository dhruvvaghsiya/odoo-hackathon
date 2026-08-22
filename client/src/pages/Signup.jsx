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
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 md:p-12">
      <div className="surface w-full max-w-2xl p-8 md:p-12 shadow-md space-y-6">
        {/* Photo Avatar Circle as required by wireframe Screen 2 */}
        <div className="flex flex-col items-center justify-center">
          <label className="cursor-pointer group relative">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-ink/40 bg-paper-warm overflow-hidden flex flex-col items-center justify-center text-ink-subtle group-hover:border-terracotta transition-colors shadow-xs">
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
          <span className="text-label text-[10px] block mb-1">REGISTRATION SCREEN (SCREEN 2)</span>
          <h2 className="font-display text-3xl text-ink">Register Users</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Fill in your explorer details to initialize your passport.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="input-field"
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
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="input-field"
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
              className="input-field font-mono"
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
            className="btn btn-terracotta w-full justify-center !py-3.5 mt-2 shadow-xs"
          >
            {loading ? 'Registering...' : (
              <>
                Register Users <ArrowRight size={16} />
              </>
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
