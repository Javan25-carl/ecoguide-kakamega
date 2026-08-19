import { Bell, Loader2 } from "lucide-react";

export default function NotificationsPanel({ notifications, loading, onMarkRead, onMarkAllRead }) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">
          Notifications
        </h3>
        {unreadCount > 0 ? (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-forest hover:underline"
          >
            Mark all read
          </button>
        ) : (
          <Bell size={16} className="text-charcoal/40 dark:text-white/40" />
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          You're all caught up.
        </p>
      )}

      <div className="space-y-1">
        {notifications.slice(0, 6).map((n) => (
          <button
            key={n.id}
            onClick={() => !n.is_read && onMarkRead?.(n.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
              n.is_read
                ? "opacity-60"
                : "bg-forest/5 dark:bg-white/5 hover:bg-forest/10"
            }`}
          >
            <p className="text-sm font-medium text-charcoal dark:text-white">
              {n.title}
            </p>
            {n.message && (
              <p className="text-xs text-charcoal/50 dark:text-white/40 mt-0.5 line-clamp-1">
                {n.message}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
