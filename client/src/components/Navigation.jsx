import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, Compass, Users, Plus, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/trips', icon: Map, label: 'My Trips' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/community', icon: Users, label: 'Community' },
];

export default function Navigation() {
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Desktop side navigation */}
      <nav className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] border-r border-warm-gray-lighter bg-paper pt-6 px-3 shrink-0"
           aria-label="Main navigation">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-terracotta/8 text-terracotta'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-warm'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-terracotta/8 text-terracotta'
                    : 'text-ink-muted hover:text-ink hover:bg-paper-warm'
                }`
              }
            >
              <Settings size={18} />
              Admin
            </NavLink>
          )}
        </div>

        {/* New Trip CTA */}
        <div className="mt-auto pb-6 pt-4">
          <NavLink
            to="/trips/new"
            className="btn btn-terracotta w-full justify-center no-underline"
          >
            <Plus size={16} />
            New Journey
          </NavLink>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-sm border-t border-warm-gray-lighter"
           aria-label="Mobile navigation">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium no-underline transition-colors ${
                  isActive ? 'text-terracotta' : 'text-ink-subtle'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/trips/new"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-terracotta no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
