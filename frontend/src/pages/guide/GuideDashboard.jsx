import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid, ClipboardList, UserCircle2, Star, BadgeCheck, Clock, Wallet, CheckCircle2, MessageCircle,
} from "lucide-react";
import DashboardShell from "../../layouts/DashboardShell.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import AvailabilityCard from "../../components/dashboard/AvailabilityCard.jsx";
import BookingRequestCard from "../../components/dashboard/BookingRequestCard.jsx";
import IncomeChart from "../../components/dashboard/IncomeChart.jsx";
import ReviewsList from "../../components/dashboard/ReviewsList.jsx";
import GuideProfileForm from "../../components/dashboard/GuideProfileForm.jsx";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSocket } from "../../services/socket.js";
import api from "../../services/api.js";

const NAV_ITEMS = [
  { path: "/guide/dashboard", label: "Dashboard", icon: LayoutGrid },
  { path: "/guide/dashboard#booking-requests", label: "Booking requests", icon: ClipboardList },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/guide/dashboard#guide-profile", label: "My profile", icon: UserCircle2 },
];

function monthLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", { month: "short" });
}

export default function GuideDashboard() {
  const { user } = useAuth();

  const [guide, setGuide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    setLoadingNotifications(true);
    api
      .get("/notifications/")
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotifications(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNew = (notification) => setNotifications((prev) => [notification, ...prev]);
    socket.on("new_notification", handleNew);
    return () => socket.off("new_notification", handleNew);
  }, []);

  const handleMarkRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    });
  };

  const handleMarkAllRead = () => {
    api.put("/notifications/read-all").then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  const fetchGuide = useCallback(() => {
    setLoadingGuide(true);
    api
      .get("/guides/me")
      .then(({ data }) => setGuide(data.guide))
      .finally(() => setLoadingGuide(false));
  }, []);

  useEffect(() => { fetchGuide(); }, [fetchGuide]);

  useEffect(() => {
    setLoadingBookings(true);
    api
      .get("/bookings/guide/incoming")
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  useEffect(() => {
    if (!guide?.id) return;
    setLoadingReviews(true);
    api
      .get(`/reviews/guide/${guide.id}`)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [guide?.id]);

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      const { data } = await api.put(`/bookings/${bookingId}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const income = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    return { pending, accepted, completed, income };
  }, [bookings]);

  const incomeByMonth = useMemo(() => {
    const map = {};
    bookings
      .filter((b) => b.status === "completed")
      .forEach((b) => {
        const label = monthLabel(b.trip_date);
        map[label] = (map[label] || 0) + (b.total_price || 0);
      });
    return Object.entries(map).map(([month, earnings]) => ({ month, earnings }));
  }, [bookings]);

  const pendingRequests = bookings.filter((b) => b.status === "pending" || b.status === "accepted");

  return (
    <DashboardShell navItems={NAV_ITEMS} title="Guide dashboard">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">
          Habari, {user?.full_name?.split(" ")[0] || "Guide"} 👋
        </h2>
        {!loadingGuide && guide && (
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              guide.is_approved ? "bg-forest/10 text-forest" : "bg-gold/15 text-gold"
            }`}
          >
            <BadgeCheck size={13} />
            {guide.is_approved ? "Verified guide" : "Pending verification"}
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Clock} label="Pending requests" value={stats.pending} accent="gold" />
        <StatCard icon={CheckCircle2} label="Accepted tours" value={stats.accepted} accent="sky" />
        <StatCard icon={Star} label="Completed tours" value={guide?.total_tours_completed ?? stats.completed} accent="forest" />
        <StatCard icon={Wallet} label="Total earnings" value={`KSh ${stats.income.toLocaleString()}`} accent="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div id="booking-requests" className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6 scroll-mt-24">
            <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-2">
              Booking requests
            </h3>
            {loadingBookings && (
              <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">Loading...</p>
            )}
            {!loadingBookings && pendingRequests.length === 0 && (
              <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
                No pending or active requests right now.
              </p>
            )}
            {pendingRequests.map((b) => (
              <BookingRequestCard
                key={b.id}
                booking={b}
                onUpdateStatus={handleUpdateStatus}
                updating={updatingId === b.id}
              />
            ))}
          </div>

          <IncomeChart data={incomeByMonth} />

          <div id="guide-profile" className="scroll-mt-24">
            {!loadingGuide && guide && <GuideProfileForm guide={guide} onSaved={setGuide} />}
          </div>
        </div>

        <div className="space-y-6">
          <NotificationsPanel
            notifications={notifications}
            loading={loadingNotifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
          {!loadingGuide && guide && (
            <AvailabilityCard guide={guide} onUpdated={setGuide} />
          )}
          <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">Rating</h3>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-3xl text-charcoal dark:text-white">
                {guide?.average_rating?.toFixed?.(1) ?? "—"}
              </span>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(guide?.average_rating || 0)
                          ? "fill-gold text-gold"
                          : "text-charcoal/15 dark:text-white/15"
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-charcoal/45 dark:text-white/40 mt-1">
                  {guide?.total_reviews ?? 0} reviews
                </p>
              </div>
            </div>
          </div>
          <ReviewsList reviews={reviews} loading={loadingReviews} />
        </div>
      </div>
    </DashboardShell>
  );
}
