import { useState, useEffect, useRef } from "react";
import { Bell, Loader2 } from "lucide-react";
import { getSocket } from "../../services/socket.js";
import api from "../../services/api.js";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    api
      .get("/notifications/")
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on("new_notification", handleNew);
    return () => socket.off("new_notification", handleNew);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    });
  };

  const markAllRead = () => {
    api.put("/notifications/read-all").then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-soft dark:hover:bg-white/10 text-charcoal/60 dark:text-white/60"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-[10px] font-bold text-charcoal grid place-items-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#1c262b] border border-charcoal/10 dark:border-white/10 rounded-xl shadow-soft z-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal/10 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c262b]">
            <span className="text-sm font-semibold text-charcoal dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-forest hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm p-4">
              <Loader2 size={14} className="animate-spin" /> Loading...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <p className="text-sm text-charcoal/45 dark:text-white/40 p-6 text-center">
              You're all caught up.
            </p>
          )}

          {notifications.slice(0, 15).map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`w-full text-left px-4 py-3 border-b border-charcoal/5 dark:border-white/5 last:border-0 transition-colors ${
                n.is_read ? "opacity-60" : "bg-forest/5 dark:bg-white/5 hover:bg-forest/10"
              }`}
            >
              <p className="text-sm font-medium text-charcoal dark:text-white">{n.title}</p>
              {n.message && (
                <p className="text-xs text-charcoal/50 dark:text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
