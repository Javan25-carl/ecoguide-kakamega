import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Trees, Waves, Bird, Star, Search, X } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import FavoriteButton from "../components/common/FavoriteButton.jsx";
import api from "../services/api.js";

const ICON_BY_CATEGORY = {
  Forest: Trees,
  "Nature Trail": Bird,
  Waterfall: Waves,
};
const GRADIENT_BY_CATEGORY = {
  Forest: "from-forest to-forest-light",
  "Nature Trail": "from-emerald to-sky",
  Waterfall: "from-sky to-forest-light",
};

export default function AttractionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
    setLoading(true);
    api
      .get("/attractions/", { params: q ? { q } : {} })
      .then(({ data }) => setAttractions(data.attractions || []))
      .catch(() => setAttractions([]))
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    if (attractions.length === 0) return;
    api
      .get("/favorites/status", { params: { attraction_ids: attractions.map((a) => a.id).join(",") } })
      .then(({ data }) => setFavoritedIds(new Set(data.attraction_ids || [])))
      .catch(() => {});
  }, [attractions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchInput.trim() ? { q: searchInput.trim() } : {});
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="font-semibold text-3xl text-charcoal mb-2">Attractions in Kakamega</h1>
        <p className="text-charcoal/55 mb-6">Forest reserves, nature trails, and waterfalls to explore.</p>

        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8 max-w-md">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-card">
            <Search size={16} className="text-charcoal/40 shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search attractions..."
              className="w-full text-sm text-charcoal outline-none bg-transparent"
            />
            {q && (
              <button type="button" onClick={clearSearch} className="text-charcoal/40 hover:text-charcoal shrink-0">
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-forest text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-forest-light transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {q && !loading && (
          <p className="text-sm text-charcoal/50 mb-6">
            {attractions.length} result{attractions.length !== 1 && "s"} for "{q}"
          </p>
        )}

        {loading && <p className="text-sm text-charcoal/45 py-10 text-center">Loading...</p>}

        {!loading && attractions.length === 0 && (
          <p className="text-sm text-charcoal/45 py-10 text-center">
            No attractions match "{q}" — try a different search.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {attractions.map((a) => {
            const Icon = ICON_BY_CATEGORY[a.category] || Trees;
            const gradient = GRADIENT_BY_CATEGORY[a.category] || "from-forest to-emerald";
            return (
              <Link
                key={a.id}
                to={`/attractions/${a.id}`}
                className="rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-shadow bg-white group"
              >
                <div
                  className={`h-40 relative flex items-center justify-center ${
                    a.cover_image_url ? "bg-charcoal" : `bg-gradient-to-br ${gradient}`
                  }`}
                >
                  {a.cover_image_url ? (
                    <img
                      src={a.cover_image_url}
                      alt={a.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Icon size={40} className="text-white/90 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-charcoal px-2.5 py-1 rounded-full z-10">
                    {a.category}
                  </span>
                  <FavoriteButton
                    type="attraction"
                    id={a.id}
                    initialFavorited={favoritedIds.has(a.id)}
                    size={16}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white z-10"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-charcoal">{a.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    {a.average_rating > 0 ? (
                      <span className="flex items-center gap-1 text-sm text-charcoal/55">
                        <Star size={13} className="fill-gold text-gold" /> {a.average_rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-charcoal/40">No reviews yet</span>
                    )}
                    <span className="text-sm text-charcoal/55">KSh {a.entrance_fee}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
