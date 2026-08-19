import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Compass, BookMarked, MessageCircle, ClipboardList, UserCircle2,
  Users, ClipboardCheck, Calendar, Clock, Users2, MapPin, Loader2, X, Check,
  CreditCard, ArrowLeft,
} from "lucide-react";
import DashboardShell from "../layouts/DashboardShell.jsx";
import BookingTimeline from "../components/booking/BookingTimeline.jsx";
import PriceBreakdown from "../components/booking/PriceBreakdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const NAV_BY_ROLE = {
  tourist: [
    { path: "/tourist/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/guides", label: "Find guides", icon: Compass },
    { path: "/tourist/bookings", label: "My bookings", icon: BookMarked },
    { path: "/messages", label: "Messages", icon: MessageCircle },
  ],
  guide: [
    { path: "/guide/dashboard", label: "Dashboard", icon: LayoutGrid },
    { path: "/guide/dashboard#booking-requests", label: "Booking requests", icon: ClipboardList },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/guide/dashboard#guide-profile", label: "My profile", icon: UserCircle2 },
  ],
  admin: [
    { path: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
    { path: "/admin/dashboard#user-management", label: "Users", icon: Users },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/admin/dashboard#booking-management", label: "Bookings", icon: ClipboardCheck },
  ],
};

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  accepted: "bg-forest/15 text-forest",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-charcoal/10 text-charcoal/50",
  completed: "bg-sky/15 text-sky",
};

const PAYMENT_STYLE = {
  unpaid: "bg-charcoal/10 text-charcoal/50 dark:bg-white/10 dark:text-white/50",
  paid: "bg-forest/15 text-forest",
};

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const fetchBooking = () => {
    setLoading(true);
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBooking, [id]);

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.tourist;

  const isTourist = user && booking && user.id === booking.tourist_id;
  const isGuideOwner = user?.role === "guide" && booking; // backend already scoped visibility to the assigned guide
  const isAdmin = user?.role === "admin";

  const updateStatus = async (status, extra = {}) => {
    setActing(true);
    setError("");
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status, ...extra });
      setBooking(data.booking);
      setShowRejectPrompt(false);
      setRejectReason("");
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't update this booking.");
    } finally {
      setActing(false);
    }
  };

  const markPaid = async () => {
    setActing(true);
    setError("");
    try {
      const { data } = await api.put(`/bookings/${id}/payment-status`, { payment_status: "paid" });
      setBooking(data.booking);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't update payment status.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell navItems={navItems} title="Booking">
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading booking...
        </div>
      </DashboardShell>
    );
  }

  if (notFound || !booking) {
    return (
      <DashboardShell navItems={navItems} title="Booking">
        <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-10 text-center">
          <p className="text-sm text-charcoal/50 dark:text-white/40 mb-4">
            We couldn't find that booking, or you don't have access to it.
          </p>
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-forest hover:underline">
            ← Go back
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navItems={navItems} title="Booking details">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-charcoal/55 dark:text-white/45 hover:text-forest mb-6"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <p className="text-xs text-charcoal/40 dark:text-white/35 font-mono">#{booking.id.slice(0, 8)}</p>
                <h2 className="font-semibold text-xl text-charcoal dark:text-white mt-1">
                  {booking.attraction_name || "Trip"} with {booking.guide_name || "Guide"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLE[booking.status]}`}>
                  {booking.status}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${PAYMENT_STYLE[booking.payment_status]}`}>
                  {booking.payment_status}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2.5 text-charcoal/70 dark:text-white/60">
                <Calendar size={16} className="text-forest shrink-0" /> {booking.trip_date}
              </div>
              {booking.start_time && (
                <div className="flex items-center gap-2.5 text-charcoal/70 dark:text-white/60">
                  <Clock size={16} className="text-forest shrink-0" /> {booking.start_time} · {booking.duration_hours}h
                </div>
              )}
              <div className="flex items-center gap-2.5 text-charcoal/70 dark:text-white/60">
                <Users2 size={16} className="text-forest shrink-0" />
                {booking.number_of_people} {booking.number_of_people === 1 ? "person" : "people"}
              </div>
              {booking.attraction_name && (
                <div className="flex items-center gap-2.5 text-charcoal/70 dark:text-white/60">
                  <MapPin size={16} className="text-forest shrink-0" /> {booking.attraction_name}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
              <div>
                <p className="text-xs text-charcoal/40 dark:text-white/35 mb-0.5">Tourist</p>
                <p className="text-charcoal dark:text-white font-medium">{booking.tourist_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/40 dark:text-white/35 mb-0.5">Guide</p>
                <p className="text-charcoal dark:text-white font-medium">{booking.guide_name || "—"}</p>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
                <p className="text-xs text-charcoal/40 dark:text-white/35 mb-1">Notes</p>
                <p className="text-sm text-charcoal/70 dark:text-white/60">{booking.notes}</p>
              </div>
            )}

            {booking.status === "rejected" && booking.rejection_reason && (
              <div className="mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
                <p className="text-xs text-red-500 font-medium mb-1">Rejection reason</p>
                <p className="text-sm text-charcoal/70 dark:text-white/60">{booking.rejection_reason}</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap mt-5 pt-5 border-t border-charcoal/10 dark:border-white/10">
              {isGuideOwner && booking.status === "pending" && !showRejectPrompt && (
                <>
                  <button
                    disabled={acting}
                    onClick={() => updateStatus("accepted")}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-forest text-white px-4 py-2.5 rounded-xl hover:bg-forest-light transition-colors disabled:opacity-50"
                  >
                    <Check size={15} /> Accept
                  </button>
                  <button
                    disabled={acting}
                    onClick={() => setShowRejectPrompt(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-red-50 text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X size={15} /> Reject
                  </button>
                </>
              )}

              {isGuideOwner && showRejectPrompt && (
                <div className="w-full">
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Let them know why (optional, but helpful)"
                    className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      disabled={acting}
                      onClick={() => updateStatus("rejected", { reason: rejectReason.trim() || undefined })}
                      className="text-sm font-semibold bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => setShowRejectPrompt(false)}
                      className="text-sm font-medium text-charcoal/50 dark:text-white/40 px-4 py-2.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {isGuideOwner && booking.status === "accepted" && (
                <button
                  disabled={acting}
                  onClick={() => updateStatus("completed")}
                  className="text-sm font-semibold bg-sky/15 text-sky px-4 py-2.5 rounded-xl hover:bg-sky hover:text-white transition-colors disabled:opacity-50"
                >
                  Mark completed
                </button>
              )}

              {(isTourist || isGuideOwner) && ["pending", "accepted"].includes(booking.status) && !showRejectPrompt && (
                <button
                  disabled={acting}
                  onClick={() => {
                    if (window.confirm("Cancel this booking?")) updateStatus("cancelled");
                  }}
                  className="text-sm font-semibold text-charcoal/50 dark:text-white/40 px-4 py-2.5 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  Cancel booking
                </button>
              )}

              {(isGuideOwner || isAdmin) && booking.payment_status === "unpaid" && (
                <button
                  disabled={acting}
                  onClick={markPaid}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-forest/10 text-forest px-4 py-2.5 rounded-xl hover:bg-forest hover:text-white transition-colors disabled:opacity-50 ml-auto"
                >
                  <CreditCard size={15} /> Mark as paid
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-5">Timeline</h3>
            <BookingTimeline statusHistory={booking.status_history} currentStatus={booking.status} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">Price breakdown</h3>
            <PriceBreakdown breakdown={booking.price_breakdown} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
