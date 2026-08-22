import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, ArrowRight, Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-paper flex items-center justify-center p-6 md:p-12">
      <div className="surface w-full max-w-md p-8 md:p-10 text-center shadow-md space-y-6">
        {/* Photo Avatar Circle as required by wireframe Screen 1 */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-ink/40 bg-paper-warm flex flex-col items-center justify-center text-ink-subtle shadow-xs">
            <User size={36} className="text-ink-muted mb-1" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Photo</span>
          </div>
        </div>

        <div>
          <span className="text-label text-[10px] block mb-1">LOGIN SCREEN (SCREEN 1)</span>
          <h2 className="font-display text-3xl text-ink">Sign into Canvas</h2>
          <p className="text-xs text-ink-muted mt-1 font-light">
            Enter your credentials or select a demo persona.
          </p>
        </div>

        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm text-left animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="input-group">
            <label className="input-label">Username / Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or Email"
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
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
            className="btn btn-terracotta w-full justify-center !py-3 mt-2 shadow-xs"
          >
            {loading ? 'Authenticating...' : (
              <>
                Login Button <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Personas for Quick Access */}
        <div className="pt-4 border-t border-warm-gray-lighter text-left">
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
              <span className="text-[10px] opacity-70">User</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('bob@example.com')}
              className={`p-2 border rounded-xs text-left text-xs transition-all ${
                email === 'bob@example.com' ? 'border-ink bg-ink text-paper' : 'border-warm-gray-lighter hover:border-ink'
              }`}
            >
              <span className="font-bold block">Bob</span>
              <span className="text-[10px] opacity-70">User</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('charlie@example.com')}
              className={`p-2 border rounded-xs text-left text-xs transition-all ${
                email === 'charlie@example.com' ? 'border-ink bg-ink text-paper' : 'border-warm-gray-lighter hover:border-ink'
              }`}
            >
              <span className="font-bold block">Charlie</span>
              <span className="text-[10px] opacity-70">Admin</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-ink-muted font-light">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-terracotta font-semibold hover:underline">
            Register Users
          </Link>
        </div>
      </div>
    </div>
  );
}
