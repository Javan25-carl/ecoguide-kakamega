import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid, Compass, BookMarked, MessageCircle, Heart, Settings, Star, MessageSquareText, Trash2, Loader2,
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

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .get("/reviews/mine")
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardShell navItems={NAV_ITEMS} title="My reviews">
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">Reviews you've written</h2>
        <p className="text-sm text-charcoal/55 dark:text-white/45 mt-1">
          Manage feedback you've left for guides and attractions.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading your reviews...
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-10 text-center">
          <MessageSquareText size={28} className="text-charcoal/25 dark:text-white/25 mx-auto mb-3" />
          <p className="text-sm text-charcoal/50 dark:text-white/40 mb-4">
            You haven't reviewed anything yet — reviews you leave on a guide or
            attraction page will show up here.
          </p>
          <Link to="/guides" className="text-sm font-semibold text-forest hover:underline">
            Browse guides →
          </Link>
        </div>
      )}

      <div className="space-y-4 max-w-2xl">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < r.rating ? "fill-gold text-gold" : "text-charcoal/15 dark:text-white/15"}
                    />
                  ))}
                  <span className="text-xs text-charcoal/40 dark:text-white/35 ml-1">
                    {new Date(r.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                {r.comment && (
                  <p className="text-sm text-charcoal/70 dark:text-white/60">{r.comment}</p>
                )}
                <div className="mt-2">
                  {r.guide_id && (
                    <Link to={`/guides/${r.guide_id}`} className="text-xs font-semibold text-forest hover:underline">
                      View guide →
                    </Link>
                  )}
                  {r.attraction_id && (
                    <Link to={`/attractions/${r.attraction_id}`} className="text-xs font-semibold text-forest hover:underline">
                      View attraction →
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="w-9 h-9 shrink-0 grid place-items-center rounded-full text-charcoal/40 dark:text-white/40 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete review"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
