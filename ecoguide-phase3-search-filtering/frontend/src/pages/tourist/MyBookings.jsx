import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid, Compass, BookMarked, Heart, Settings, Calendar, Loader2, X, Pencil, MessageCircle, MessageSquareText, ArrowUpRight, Search,
} from "lucide-react";
import DashboardShell from "../../layouts/DashboardShell.jsx";
import api from "../../services/api.js";

const NAV_ITEMS = [
  { path: "/tourist/dashboard", label: "Dashboard", icon: LayoutGrid },
  { path: "/guides", label: "Find guides", icon: Compass },
  { path: "/tourist/bookings", label: "My bookings", icon: BookMarked },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/tourist/favorites", label: "Favorites", icon: Heart },
  { path: "/tourist/reviews", label: "My reviews", icon: MessageSquareText },
  { path: "/tourist/settings", label: "Settings", icon: Settings },
];

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

const FILTERS = ["all", "pending", "accepted", "completed", "cancelled"];

function RescheduleRow({ booking, onSaved, onCancel }) {
  const [form, setForm] = useState({
    trip_date: booking.trip_date,
    duration_hours: booking.duration_hours,
    number_of_people: booking.number_of_people,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.put(`/bookings/${booking.id}`, form);
      onSaved(data.booking);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't update this booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 bg-soft dark:bg-white/5 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input
          type="date"
          value={form.trip_date}
          onChange={(e) => setForm({ ...form, trip_date: e.target.value })}
          className="text-sm rounded-lg border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-2.5 py-2 outline-none"
        />
        <input
          type="number"
          min={1}
          step={0.5}
          value={form.duration_hours}
          onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
          className="text-sm rounded-lg border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-2.5 py-2 outline-none"
        />
        <input
          type="number"
          min={1}
          value={form.number_of_people}
          onChange={(e) => setForm({ ...form, number_of_people: Number(e.target.value) })}
          className="text-sm rounded-lg border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-2.5 py-2 outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs font-semibold bg-forest text-white px-4 py-2 rounded-full disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-charcoal/60 dark:text-white/50 px-4 py-2"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [editingId, setEditingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api
      .get("/bookings/my")
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBookings, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status: "cancelled" });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b)));
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = useMemo(() => {
    let list = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.guide_name?.toLowerCase().includes(q) ||
          b.attraction_name?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === "oldest") sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sort === "price_high") sorted.sort((a, b) => (b.total_price || 0) - (a.total_price || 0));
    else if (sort === "price_low") sorted.sort((a, b) => (a.total_price || 0) - (b.total_price || 0));

    return sorted;
  }, [bookings, filter, search, sort]);

  return (
    <DashboardShell navItems={NAV_ITEMS} title="My bookings">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">Your trips</h2>
        <div className="flex items-center gap-1 bg-white dark:bg-[#1c262b] rounded-full p-1 shadow-card">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full capitalize transition-colors ${
                filter === f ? "bg-forest text-white" : "text-charcoal/55 dark:text-white/45"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-[#1c262b] rounded-xl px-3 py-2 shadow-card flex-1 min-w-[200px]">
          <Search size={14} className="text-charcoal/40 dark:text-white/35 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guide or attraction..."
            className="w-full text-sm bg-transparent outline-none text-charcoal dark:text-white"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs font-medium bg-white dark:bg-[#1c262b] shadow-card text-charcoal dark:text-white rounded-xl px-3 py-2.5 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price_high">Highest price</option>
          <option value="price_low">Lowest price</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading your bookings...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-10 text-center">
          <Calendar size={28} className="text-charcoal/25 dark:text-white/25 mx-auto mb-3" />
          <p className="text-sm text-charcoal/50 dark:text-white/40 mb-4">
            No {filter !== "all" && filter} bookings here yet.
          </p>
          <Link to="/tourist/dashboard" className="text-sm font-semibold text-forest hover:underline">
            Find a guide →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-charcoal dark:text-white">
                    {b.guide_name || "Guide"}
                  </h3>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[b.status]}`}>
                    {b.status}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${PAYMENT_STYLE[b.payment_status] || PAYMENT_STYLE.unpaid}`}>
                    {b.payment_status || "unpaid"}
                  </span>
                  <span className="text-[11px] font-mono text-charcoal/30 dark:text-white/25">#{b.id?.slice(0, 8)}</span>
                </div>
                <p className="text-sm text-charcoal/55 dark:text-white/45 mt-1">
                  {b.trip_date} {b.start_time && `· ${b.start_time}`} · {b.duration_hours}h ·{" "}
                  {b.number_of_people} {b.number_of_people === 1 ? "person" : "people"}
                </p>
                {b.attraction_name && (
                  <p className="text-xs text-charcoal/40 dark:text-white/35 mt-0.5">
                    At {b.attraction_name}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-charcoal dark:text-white">
                  KSh {b.total_price?.toLocaleString?.()}
                </span>
                <Link
                  to={`/bookings/${b.id}`}
                  className="w-9 h-9 grid place-items-center rounded-full text-charcoal/40 dark:text-white/35 hover:bg-soft dark:hover:bg-white/10 hover:text-forest transition-colors"
                  title="View details"
                >
                  <ArrowUpRight size={15} />
                </Link>
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                      className="w-9 h-9 grid place-items-center rounded-full bg-soft dark:bg-white/10 text-charcoal/60 dark:text-white/50 hover:bg-forest/10 hover:text-forest transition-colors"
                      title="Reschedule"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="w-9 h-9 grid place-items-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
                {b.status === "accepted" && (
                  <button
                    disabled={cancellingId === b.id}
                    onClick={() => handleCancel(b.id)}
                    className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {editingId === b.id && (
              <RescheduleRow
                booking={b}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...updated } : x)));
                  setEditingId(null);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
