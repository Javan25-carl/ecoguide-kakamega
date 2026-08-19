import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Clock, Ticket, Sun, Star, Trees, MapPin,
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import ReviewsSection from "../components/reviews/ReviewsSection.jsx";
import FavoriteButton from "../components/common/FavoriteButton.jsx";
import api from "../services/api.js";

const CATEGORY_GRADIENT = {
  Forest: "from-forest to-forest-light",
  "Nature Trail": "from-emerald to-sky",
  Waterfall: "from-sky to-forest-light",
};

export default function AttractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [nearbyGuides, setNearbyGuides] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    api
      .get("/favorites/status", { params: { attraction_ids: id } })
      .then(({ data }) => setIsFavorited((data.attraction_ids || []).includes(id)))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/attractions/${id}`)
      .then(({ data }) => setAttraction(data.attraction))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingReviews(true);
    api
      .get(`/reviews/attraction/${id}`)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  useEffect(() => {
    api
      .get("/guides/", { params: { available: true } })
      .then(({ data }) => setNearbyGuides((data.guides || []).slice(0, 3)))
      .catch(() => setNearbyGuides([]));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !attraction) {
    return (
      <div className="min-h-screen grid place-items-center bg-white text-center px-6">
        <div>
          <p className="text-charcoal/60 mb-4">We couldn't find that attraction.</p>
          <Link to="/" className="text-forest font-semibold">← Back home</Link>
        </div>
      </div>
    );
  }

  const gradient = CATEGORY_GRADIENT[attraction.category] || "from-forest to-emerald";

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />

      {/* Hero */}
      <div
        className={`h-72 md:h-96 relative flex items-end pt-20 ${
          attraction.cover_image_url ? "bg-charcoal" : `bg-gradient-to-br ${gradient}`
        }`}
      >
        {attraction.cover_image_url && (
          <img
            src={attraction.cover_image_url}
            alt={attraction.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className={`absolute inset-0 ${attraction.cover_image_url ? "bg-black/30" : "bg-black/10"}`} />
        <FavoriteButton
          type="attraction"
          id={attraction.id}
          initialFavorited={isFavorited}
          size={20}
          className="absolute top-24 right-6 z-10 w-11 h-11 bg-white/90 hover:bg-white"
        />
        <div className="max-w-5xl mx-auto px-6 pb-8 relative z-10 w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="text-xs font-semibold bg-white/90 text-charcoal px-3 py-1 rounded-full">
            {attraction.category}
          </span>
          <h1 className="font-semibold text-3xl md:text-4xl text-white mt-3">{attraction.name}</h1>
          {attraction.average_rating > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-white/90 text-sm">
              <Star size={15} className="fill-gold text-gold" />
              {attraction.average_rating.toFixed(1)} ({attraction.total_reviews} reviews)
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-7">
              <h2 className="font-semibold text-lg text-charcoal mb-3">About this place</h2>
              <p className="text-charcoal/70 leading-relaxed">{attraction.description}</p>

              {attraction.history && (
                <>
                  <h3 className="font-semibold text-charcoal mt-6 mb-2">History</h3>
                  <p className="text-charcoal/70 leading-relaxed">{attraction.history}</p>
                </>
              )}
            </div>

            {attraction.gallery_urls?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-7">
                <h2 className="font-semibold text-lg text-charcoal mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attraction.gallery_urls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={attraction.name}
                        className="w-full h-28 rounded-xl object-cover hover:opacity-85 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <ReviewsSection
              reviews={reviews}
              loading={loadingReviews}
              targetType="attraction"
              targetId={attraction.id}
              onReviewAdded={(r) => setReviews((prev) => [r, ...prev])}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-semibold text-charcoal text-sm mb-4">Visit info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-charcoal/70">
                  <Ticket size={16} className="text-forest shrink-0" />
                  Entrance: KSh {attraction.entrance_fee?.toLocaleString?.() ?? 0}
                </div>
                {attraction.opening_hours && (
                  <div className="flex items-center gap-3 text-charcoal/70">
                    <Clock size={16} className="text-forest shrink-0" />
                    {attraction.opening_hours}
                  </div>
                )}
                {attraction.best_time_to_visit && (
                  <div className="flex items-center gap-3 text-charcoal/70">
                    <Sun size={16} className="text-forest shrink-0" />
                    Best time: {attraction.best_time_to_visit}
                  </div>
                )}
                <div className="flex items-center gap-3 text-charcoal/70">
                  <MapPin size={16} className="text-forest shrink-0" />
                  {attraction.lat?.toFixed(4)}, {attraction.lng?.toFixed(4)}
                </div>
              </div>
            </div>

            {nearbyGuides.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-charcoal text-sm mb-4 flex items-center gap-2">
                  <Trees size={15} className="text-forest" /> Guides for this trail
                </h3>
                <div className="space-y-3">
                  {nearbyGuides.map((g) => (
                    <Link
                      key={g.id}
                      to={`/guides/${g.id}`}
                      className="flex items-center justify-between hover:bg-soft rounded-xl p-2 -m-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          {g.user?.full_name || "Guide"}
                        </p>
                        <p className="text-xs text-charcoal/45">
                          KSh {g.hourly_rate?.toLocaleString?.()}/hr
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-forest">View →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
