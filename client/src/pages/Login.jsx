import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, ArrowRight } from 'lucide-react';

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
      toast.success('Welcome back to GlobeTrotter.');
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
    <div className="min-h-screen relative flex items-center justify-center p-6 md:p-12 overflow-hidden bg-ink">
      {/* Scenic Background Image — kept as-is per design */}
      <img
        src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=85"
        alt="Travel Destination"
        className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px] transition-transform duration-[20000ms] ease-linear scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/40 backdrop-blur-[2px]" />

      {/* Floating atmospheric decorations */}
      <div className="absolute top-12 left-8 text-white/8 font-display text-6xl pointer-events-none select-none animate-float" style={{ animationDuration: '8s' }}>
        ✈
      </div>
      <div className="absolute bottom-20 right-10 text-white/6 font-display text-4xl pointer-events-none select-none animate-float" style={{ animationDuration: '11s', animationDelay: '2s' }}>
        ◎
      </div>
      <div className="absolute top-1/3 right-1/4 text-white/5 font-mono text-xs pointer-events-none select-none animate-fade-in" style={{ animationDelay: '1s' }}>
        48.8566°N · 2.3522°E
      </div>

      {/* Card */}
      <div className="relative z-10 surface w-full max-w-md p-8 md:p-10 text-center shadow-lg space-y-6 bg-paper/98 border border-warm-gray-light animate-auth-enter">

        {/* Photo Avatar Circle — wireframe Screen 1 requirement + hero-ring pulse */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-terracotta/40 bg-paper-warm flex flex-col items-center justify-center text-ink-subtle shadow-xs hero-ring">
            <User size={36} className="text-terracotta mb-1" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle">Photo</span>
          </div>
        </div>

        <div>
          <span className="travel-stamp text-terracotta text-[10px] animate-stamp" style={{ animationDelay: '400ms' }}>
            JOURNEY CANVAS · SIGN IN
          </span>
          <h2 className="font-display text-3xl text-ink mt-1">Welcome Back</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Your journey continues. Enter your credentials below.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm text-left animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left form-stagger">
          <div className="input-group">
            <label className="input-label">Username / Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or Email"
              className="input-field input-glow"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-field font-mono input-glow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-terracotta w-full justify-center !py-3 mt-2 shadow-xs btn-ripple"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                Authenticating
                <span className="dot-trail"><span /><span /><span /></span>
              </span>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Demo Personas — Quick Access */}
        <div className="pt-4 border-t border-warm-gray-lighter text-left">
          <span className="text-label text-[10px] block mb-2">QUICK DEMO PERSONAS</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { email: 'alice@example.com', name: 'Alice', role: 'Traveller' },
              { email: 'bob@example.com', name: 'Bob', role: 'Explorer' },
              { email: 'charlie@example.com', name: 'Charlie', role: 'Admin' },
            ].map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => setDemoAccount(p.email)}
                className={`p-2 border rounded-xs text-left text-xs transition-all card-hover-lift ${
                  email === p.email
                    ? 'border-terracotta bg-terracotta text-paper'
                    : 'border-warm-gray-lighter hover:border-terracotta'
                }`}
              >
                <span className="font-bold block">{p.name}</span>
                <span className="text-[10px] opacity-70">{p.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-ink-muted font-light">
          New to GlobeTrotter?{' '}
          <Link to="/signup" className="text-terracotta font-semibold hover:underline">
            Create an Account →
          </Link>
        </div>
      </div>
    </div>
  );
}
