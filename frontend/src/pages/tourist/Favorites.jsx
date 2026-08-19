import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid, Compass, BookMarked, MessageCircle, Heart, Settings,
  Star, HeartOff, Loader2, MessageSquareText,
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

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | guide | attraction
  const [removingId, setRemovingId] = useState(null);

  const fetchFavorites = () => {
    setLoading(true);
    api
      .get("/favorites/")
      .then(({ data }) => setFavorites(data.favorites || []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchFavorites, []);

  const handleRemove = async (fav) => {
    setRemovingId(fav.id);
    const endpoint =
      fav.type === "guide"
        ? `/favorites/guides/${fav.guide.id}`
        : `/favorites/attractions/${fav.attraction.id}`;
    try {
      await api.delete(endpoint);
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = tab === "all" ? favorites : favorites.filter((f) => f.type === tab);

  return (
    <DashboardShell navItems={NAV_ITEMS} title="Favorites">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">Saved for later</h2>
        <div className="flex items-center gap-1 bg-white dark:bg-[#1c262b] rounded-full p-1 shadow-card">
          {["all", "guide", "attraction"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full capitalize transition-colors ${
                tab === t ? "bg-forest text-white" : "text-charcoal/55 dark:text-white/45"
              }`}
            >
              {t === "all" ? "All" : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading favorites...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-10 text-center">
          <Heart size={28} className="text-charcoal/25 dark:text-white/25 mx-auto mb-3" />
          <p className="text-sm text-charcoal/50 dark:text-white/40 mb-4">
            Nothing saved yet — tap the heart on any guide or attraction to keep it here.
          </p>
          <Link to="/guides" className="text-sm font-semibold text-forest hover:underline">
            Browse guides →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((fav) => {
          if (fav.type === "guide" && fav.guide) {
            const g = fav.guide;
            return (
              <div key={fav.id} className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/guides/${g.id}`} className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-forest text-white grid place-items-center font-semibold shrink-0">
                      {(g.user?.full_name || "G").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-charcoal dark:text-white text-sm truncate">
                        {g.user?.full_name}
                      </h3>
                      <p className="text-xs text-charcoal/50 dark:text-white/45 truncate">
                        {g.specialization || "General eco-tours"}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(fav)}
                    disabled={removingId === fav.id}
                    className="w-8 h-8 shrink-0 grid place-items-center rounded-full text-charcoal/40 dark:text-white/40 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    <HeartOff size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
                  <span className="flex items-center gap-1 text-xs text-charcoal/55 dark:text-white/45">
                    <Star size={13} className="fill-gold text-gold" />
                    {g.average_rating?.toFixed?.(1) ?? "New"}
                  </span>
                  <span className="text-sm font-semibold text-charcoal dark:text-white">
                    KSh {g.hourly_rate?.toLocaleString?.()}/hr
                  </span>
                </div>
              </div>
            );
          }

          if (fav.type === "attraction" && fav.attraction) {
            const a = fav.attraction;
            return (
              <div key={fav.id} className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/attractions/${a.id}`} className="min-w-0">
                    <span className="text-xs font-semibold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
                      {a.category}
                    </span>
                    <h3 className="font-semibold text-charcoal dark:text-white mt-2 truncate">
                      {a.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleRemove(fav)}
                    disabled={removingId === fav.id}
                    className="w-8 h-8 shrink-0 grid place-items-center rounded-full text-charcoal/40 dark:text-white/40 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    <HeartOff size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
                  {a.average_rating > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-charcoal/55 dark:text-white/45">
                      <Star size={13} className="fill-gold text-gold" /> {a.average_rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs text-charcoal/40 dark:text-white/35">No reviews yet</span>
                  )}
                  <span className="text-sm font-semibold text-charcoal dark:text-white">
                    KSh {a.entrance_fee}
                  </span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </DashboardShell>
  );
}
