import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center items-center p-6">
      <div className="surface p-8 max-w-md w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <MapPin size={24} className="text-terracotta" strokeWidth={2.5} />
          <span className="font-display text-2xl text-ink">GlobeTrotter</span>
        </div>

        <div>
          <span className="text-label text-[10px] block mb-1">ACCOUNT RECOVERY</span>
          <h2 className="font-display text-2xl text-ink">Reset Explorer Access</h2>
          <p className="text-xs text-ink-muted font-light mt-1">
            Enter your registered email address to receive passport recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="bg-olive-muted/30 border border-olive p-4 rounded-sm text-left space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-olive font-semibold text-xs">
              <CheckCircle size={16} /> Recovery Link Dispatched
            </div>
            <p className="text-xs text-ink-muted font-light">
              If an explorer account is registered with <strong className="font-mono">{email}</strong>, you will receive password reset guidance shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="input-field text-sm"
              />
            </div>

            <button type="submit" className="btn btn-terracotta w-full justify-center">
              <Send size={14} /> Send Recovery Email
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-warm-gray-lighter">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-semibold no-underline"
          >
            <ArrowLeft size={13} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
