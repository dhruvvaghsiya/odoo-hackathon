import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signup(name, email, password);
      toast.success('Your explorer profile has been created.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Left Column: Editorial Background */}
      <div className="md:w-1/2 relative bg-ink text-paper p-8 md:p-16 flex flex-col justify-between overflow-hidden min-h-[380px] md:min-h-screen">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80"
            alt="Travel background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="travel-stamp text-olive bg-white/10 backdrop-blur-xs border-olive">
              REGISTER / PASSPORT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={24} className="text-terracotta" strokeWidth={2.5} />
            <span className="font-display text-2xl tracking-tight text-white">GlobeTrotter</span>
          </div>
        </div>

        <div className="relative z-10 my-8 md:my-0">
          <p className="text-label text-terracotta text-xs tracking-widest uppercase mb-3">
            START YOUR ODYSSEY
          </p>
          <h1 className="text-display text-4xl md:text-6xl text-white font-normal leading-tight">
            PLAN • DISCOVER • GO.
          </h1>
          <p className="text-warm-gray-light text-sm md:text-base font-light mt-4 max-w-md">
            Join the modern community of explorers creating structured, shareable, and beautifully budget-conscious journey canvases.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-warm-gray-light font-mono border-t border-white/10 pt-4">
          <span>THE JOURNEY CANVAS</span>
          <span>AUTONOMOUS EXPLORATION</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="mb-8">
          <span className="text-label block mb-1">ONBOARDING</span>
          <h2 className="font-display text-3xl md:text-4xl text-ink">Create Explorer Account</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Set up your identity to start building your first trip route.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm mb-6 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eleanor@example.com"
              className="input-field"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-terracotta w-full justify-center !py-3.5 mt-2"
          >
            {loading ? 'Creating Passport...' : (
              <>
                Register & Start Planning <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-ink-muted font-light">
          Already registered?{' '}
          <Link to="/login" className="text-terracotta font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
