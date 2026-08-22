import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationsService } from '../services/notifications';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsService.list();
      const items = res.data?.notifications || [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch {
      // Silent fail — notifications are non-critical
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button
        className="btn-icon relative"
        onClick={() => setShowPanel(!showPanel)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-full mt-1 w-80 surface surface--elevated z-50 animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-warm-gray-lighter">
              <span className="text-label">Notifications</span>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-terracotta font-medium hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-ink-subtle">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-warm-gray-lighter last:border-0 ${
                      !n.is_read ? 'bg-terracotta/3' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-ink-subtle mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
