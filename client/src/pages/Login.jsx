import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, ArrowRight, Eye, EyeOff, UserCheck, Compass, Shield } from 'lucide-react';
import { formatErrorMessage } from '../utils/formatError';

/* ── High-quality destination images for the left panel ────── */
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=90',
    city: 'Paris, France',
    quote: 'Every city has a soul — Paris has a heartbeat.',
  },
  {
    src: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=90',
    city: 'Tokyo, Japan',
    quote: 'Between ancient shrines and neon lights, find yourself.',
  },
  {
    src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=90',
    city: 'Serengeti, Africa',
    quote: 'The world is a book. Those who do not travel read only one page.',
  },
];

export default function Login() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slide] = useState(() => Math.floor(Math.random() * HERO_SLIDES.length));

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const hero = HERO_SLIDES[slide];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success('Welcome back to GlobeTrotter.');
      navigate('/');
    } catch (err) {
      setError(formatErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex bg-ink overflow-hidden">

      {/* ── LEFT: High-Quality Destination Image ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden flex-col">
        {/* Background image */}
        <img
          src={hero.src}
          alt={hero.city}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15000ms] ease-linear scale-110 animate-ken-burns"
        />
        {/* Deep gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />

        {/* Floating atmospheric elements */}
        <div className="absolute top-8 left-8 text-white/10 font-mono text-xs tracking-[0.3em] animate-fade-in">
          GLOBETROTTER · JOURNEY CANVAS
        </div>
        <div className="absolute top-12 right-8 text-white/15 font-mono text-[10px] tracking-widest animate-fade-in" style={{ animationDelay: '0.5s' }}>
          48.8566°N · 2.3522°E
        </div>

        {/* Brand + quote content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-10 pb-14 max-w-lg animate-slide-up">
          <span className="travel-stamp text-terracotta border-terracotta bg-white/10 text-[10px] mb-6 self-start animate-stamp">
            SCREEN 1 · SIGN IN
          </span>

          <h1 className="font-display text-4xl xl:text-5xl text-white leading-tight mb-4">
            {hero.quote.split(' ').slice(0, 4).join(' ')}{' '}
            <em className="text-terracotta-light not-italic">
              {hero.quote.split(' ').slice(4).join(' ')}
            </em>
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-white/60 text-sm font-light">{hero.city}</span>
          </div>

          {/* Slide dots */}
          <div className="flex gap-2 mt-6">
            {HERO_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-8 bg-terracotta' : 'w-3 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ─────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-paper min-h-screen">
        <div className="w-full max-w-md px-8 py-10 md:px-12 animate-auth-enter">

          {/* Wireframe Screen 1 Photo Avatar Circle */}
          <div className="mb-6 flex flex-col items-center lg:items-start">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-terracotta/50 bg-paper-warm flex flex-col items-center justify-center text-ink-subtle shadow-xs hero-ring mb-3">
              <User size={30} className="text-terracotta mb-0.5" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-ink-muted">Photo</span>
            </div>
            <span className="travel-stamp text-terracotta text-[10px] animate-stamp inline-block mb-1">
              LOGIN SCREEN (SCREEN 1)
            </span>
            <h2 className="font-display text-3xl text-ink">Sign into Canvas</h2>
            <p className="text-ink-subtle text-xs mt-1 font-light">
              Enter your credentials or select a demo persona below.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-danger-muted text-danger text-xs p-3 rounded-sm animate-fade-in border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 form-stagger">
            {/* Email */}
            <div className="input-group">
              <label className="input-label">Username / Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field input-glow"
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-terracotta w-full justify-center !py-3.5 shadow-sm btn-ripple mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  Signing in
                  <span className="dot-trail"><span /><span /><span /></span>
                </span>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-warm-gray-lighter" />
            <span className="text-[11px] text-ink-subtle font-mono uppercase tracking-wider">Quick Demo</span>
            <div className="h-px flex-1 bg-warm-gray-lighter" />
          </div>

          {/* Demo Personas */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { email: 'alice@example.com', name: 'Alice', role: 'Traveller', Icon: UserCheck, color: 'text-terracotta' },
              { email: 'bob@example.com',   name: 'Bob',   role: 'Explorer',  Icon: Compass,   color: 'text-olive' },
              { email: 'charlie@example.com', name: 'Charlie', role: 'Admin', Icon: Shield,    color: 'text-ink' },
            ].map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => setDemoAccount(p.email)}
                className={`p-3 border rounded-xs text-left text-xs transition-all card-hover-lift group ${
                  email === p.email
                    ? 'border-terracotta bg-terracotta/5 text-terracotta'
                    : 'border-warm-gray-lighter hover:border-terracotta/50 bg-paper'
                }`}
              >
                <p.Icon size={16} className={`mb-1.5 ${p.color}`} />
                <span className="font-semibold block text-ink">{p.name}</span>
                <span className="text-[10px] text-ink-subtle">{p.role}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-ink-subtle mt-6 font-light">
            All demo accounts use password{' '}
            <code className="font-mono bg-paper-warm px-1.5 py-0.5 rounded text-ink">password123</code>
          </p>

          {/* Register link */}
          <p className="text-center text-sm text-ink-muted mt-6">
            New to GlobeTrotter?{' '}
            <Link to="/signup" className="text-terracotta font-semibold hover:underline">
              Create an account →
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
