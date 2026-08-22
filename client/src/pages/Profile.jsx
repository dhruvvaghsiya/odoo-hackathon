import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersService } from '../services/users';
import PageHeader from '../components/PageHeader';
import { User, Mail, Globe, Shield, Trash2, Check } from 'lucide-react';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await usersService.updateProfile({ name, language });
      const updatedUser = res.data?.user;
      updateUser(updatedUser || { name, language });
      toast.success('Explorer passport updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your explorer account? All journeys, routes, and expenses will be erased.')) {
      return;
    }
    try {
      await usersService.deleteAccount();
      toast.info('Account deleted.');
      logout();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="page page-content max-w-2xl mx-auto space-y-8">
      <PageHeader
        stamp="PASSPORT / SETTINGS"
        coordinates={`ROLE: ${user?.role?.toUpperCase() || 'USER'} • ID: ${user?.id?.slice(0, 8) || '...'}`}
        title="Explorer Passport"
        subtitle="Manage your identity, personal preferences, and security settings."
      />

      <div className="surface p-6 md:p-8 space-y-6">
        {error && (
          <div className="bg-danger-muted text-danger text-xs p-3 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address (Permanent)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="input-field opacity-60 cursor-not-allowed bg-paper-warm"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Preferred Interface Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
            >
              <option value="en">English (Default)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-warm-gray-lighter flex justify-end">
            <button type="submit" disabled={loading} className="btn btn-terracotta">
              <Check size={14} />
              {loading ? 'Saving...' : 'Save Passport Updates'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="surface p-6 border-danger/40 bg-danger-muted/10 space-y-3">
        <h4 className="font-display text-base text-danger">Danger Zone</h4>
        <p className="text-xs text-ink-muted font-light">
          Permanently delete your GlobeTrotter passport. This will cancel all active journeys and wipe your financial expense records.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="btn btn-sm btn-ghost text-danger hover:bg-danger-muted"
        >
          <Trash2 size={14} /> Delete Explorer Account
        </button>
      </div>
    </div>
  );
}
