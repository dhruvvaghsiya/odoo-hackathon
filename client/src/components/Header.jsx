import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Bell, LogOut, User, Search } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-warm-gray-lighter">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <MapPin size={20} className="text-terracotta" strokeWidth={2.5} />
          <span className="font-display text-lg text-ink tracking-tight">
            GlobeTrotter
          </span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <button
            className="btn-icon"
            onClick={() => navigate('/discover')}
            aria-label="Discover destinations"
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <div className="relative">
            <button
              className="btn-icon flex items-center gap-2 !w-auto !px-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-terracotta">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium text-ink-muted">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 surface surface--elevated z-50 py-1 animate-scale-in">
                  <div className="px-3 py-2 border-b border-warm-gray-lighter">
                    <p className="text-sm font-medium text-ink">{user?.name}</p>
                    <p className="text-xs text-ink-subtle">{user?.email}</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-muted hover:bg-paper-warm transition-colors"
                    onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  >
                    <User size={14} />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-paper-warm transition-colors"
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
