import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success('Welcome back to your Journey Canvas.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Left Column: Editorial Travel Visual Composition */}
      <div className="md:w-1/2 relative bg-ink text-paper p-8 md:p-16 flex flex-col justify-between overflow-hidden min-h-[380px] md:min-h-screen">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
            alt="Travel inspiration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        </div>

        {/* Top Branding & Meta */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="travel-stamp text-terracotta bg-white/10 backdrop-blur-xs border-terracotta">
              EXPEDITION / 2026
            </span>
            <span className="coordinates text-[10px] text-warm-gray-light">
              LAT 48.8566° N • LON 2.3522° E
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={24} className="text-terracotta" strokeWidth={2.5} />
            <span className="font-display text-2xl tracking-tight text-white">GlobeTrotter</span>
          </div>
        </div>

        {/* Hero Editorial Typography */}
        <div className="relative z-10 my-8 md:my-0">
          <p className="text-label text-terracotta text-xs tracking-widest uppercase mb-3">
            THE JOURNEY CANVAS
          </p>
          <h1 className="text-display text-4xl md:text-6xl text-white font-normal leading-tight">
            YOUR NEXT JOURNEY STARTS HERE.
          </h1>
          <p className="text-warm-gray-light text-sm md:text-base font-light mt-4 max-w-md">
            Design multi-city itineraries, map real-time routes, budget gracefully, and document life on the road.
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex items-center justify-between text-xs text-warm-gray-light font-mono border-t border-white/10 pt-4">
          <span>PLAN • DISCOVER • GO</span>
          <span>ODOO HACKATHON EDITION</span>
        </div>
      </div>

      {/* Right Column: Editorial Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-paper">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="text-label block mb-1">AUTHENTICATION</span>
            <h2 className="font-display text-3xl md:text-4xl text-ink">Sign into Canvas</h2>
            <p className="text-xs text-ink-muted mt-1 font-light">
              Enter your credentials or select a hackathon demo persona.
            </p>
          </div>

          {error && (
            <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm mb-6 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center">
                <label className="input-label">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-terracotta w-full justify-center !py-3.5 mt-2"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Enter GlobeTrotter <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Personas for Judges */}
          <div className="mt-8 pt-6 border-t border-warm-gray-lighter">
            <span className="text-label text-[10px] block mb-2">QUICK DEMO PERSONAS</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('alice@example.com')}
                className={`p-2 border rounded-xs text-left text-xs transition-all ${
                  email === 'alice@example.com' ? 'border-ink bg-ink text-paper' : 'border-warm-gray-lighter hover:border-ink'
                }`}
              >
                <span className="font-bold block">Alice</span>
                <span className="text-[10px] opacity-70">User (3 Trips)</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('bob@example.com')}
                className={`p-2 border rounded-xs text-left text-xs transition-all ${
                  email === 'bob@example.com' ? 'border-ink bg-ink text-paper' : 'border-warm-gray-lighter hover:border-ink'
                }`}
              >
                <span className="font-bold block">Bob</span>
                <span className="text-[10px] opacity-70">User (2 Trips)</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('charlie@example.com')}
                className={`p-2 border rounded-xs text-left text-xs transition-all ${
                  email === 'charlie@example.com' ? 'border-ink bg-ink text-paper' : 'border-warm-gray-lighter hover:border-ink'
                }`}
              >
                <span className="font-bold block">Charlie</span>
                <span className="text-[10px] opacity-70">Admin Role</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-ink-muted font-light">
            Don't have an explorer account yet?{' '}
            <Link to="/signup" className="text-terracotta font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
