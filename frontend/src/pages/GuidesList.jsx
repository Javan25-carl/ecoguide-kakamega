import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Star, Globe2, CircleDot } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import GuideFilters from "../components/dashboard/GuideFilters.jsx";
import FavoriteButton from "../components/common/FavoriteButton.jsx";
import api from "../services/api.js";

export default function GuidesList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    language: "", maxPrice: "", minRating: "", availableOnly: false,
  });

  const fetchGuides = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.language) params.language = filters.language;
    if (filters.maxPrice) params.max_price = filters.maxPrice;
    if (filters.minRating) params.min_rating = filters.minRating;
    if (filters.availableOnly) params.available = true;

    api
      .get("/guides/", { params })
      .then(({ data }) => setGuides(data.guides || []))
      .catch(() => setGuides([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  useEffect(() => {
    if (guides.length === 0) return;
    api
      .get("/favorites/status", { params: { guide_ids: guides.map((g) => g.id).join(",") } })
      .then(({ data }) => setFavoritedIds(new Set(data.guide_ids || [])))
      .catch(() => {});
  }, [guides]);

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="font-semibold text-3xl text-charcoal mb-2">Certified eco-guides</h1>
        <p className="text-charcoal/55 mb-8">
          Every guide here is verified against Kakamega Forest conservation program standards.
        </p>

        <div className="mb-6">
          <GuideFilters filters={filters} onChange={setFilters} />
        </div>

        {loading && (
          <p className="text-sm text-charcoal/45 py-10 text-center">Loading guides...</p>
        )}
        {!loading && guides.length === 0 && (
          <p className="text-sm text-charcoal/45 py-10 text-center">No guides match those filters.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((g) => (
            <Link
              key={g.id}
              to={`/guides/${g.id}`}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-forest text-white grid place-items-center font-semibold text-lg shrink-0">
                    {(g.user?.full_name || "G").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-charcoal truncate">{g.user?.full_name}</h3>
                    <p className="text-sm text-charcoal/55 truncate">{g.specialization || "General eco-tours"}</p>
                  </div>
                </div>
                <FavoriteButton type="guide" id={g.id} initialFavorited={favoritedIds.has(g.id)} size={17} className="w-8 h-8 shrink-0" />
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-charcoal/55">
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-gold text-gold" />
                  {g.average_rating?.toFixed?.(1) ?? "New"}
                </span>
                {g.is_available && (
                  <span className="flex items-center gap-1 text-forest">
                    <CircleDot size={10} /> Available
                  </span>
                )}
                {g.languages?.length > 0 && (
                  <span className="flex items-center gap-1 truncate">
                    <Globe2 size={13} /> {g.languages.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-charcoal/10">
                <span className="font-semibold text-charcoal">KSh {g.hourly_rate?.toLocaleString?.()}</span>
                <span className="text-charcoal/45 text-sm"> /hour</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
