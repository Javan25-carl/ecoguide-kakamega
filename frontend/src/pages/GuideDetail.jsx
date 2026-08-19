import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star, Globe2, Award, Clock, CircleDot, MessageCircle, ArrowLeft, Loader2,
} from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import BookingModal from "../components/booking/BookingModal.jsx";
import ReviewsSection from "../components/reviews/ReviewsSection.jsx";
import FavoriteButton from "../components/common/FavoriteButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!guide?.id) return;
    api
      .get("/favorites/status", { params: { guide_ids: guide.id } })
      .then(({ data }) => setIsFavorited((data.guide_ids || []).includes(guide.id)))
      .catch(() => {});
  }, [guide?.id]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/guides/${id}`)
      .then(({ data }) => setGuide(data.guide))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingReviews(true);
    api
      .get(`/reviews/guide/${id}`)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  const handleMessage = () => {
    if (!user) return navigate("/login");
    navigate(`/messages/${guide.user.id}`);
  };

  const handleBookClick = () => {
    if (!user) return navigate("/login");
    if (user.role !== "tourist") return;
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !guide) {
    return (
      <div className="min-h-screen grid place-items-center bg-white text-center px-6">
        <div>
          <p className="text-charcoal/60 mb-4">We couldn't find that guide.</p>
          <Link to="/" className="text-forest font-semibold">← Back home</Link>
        </div>
      </div>
    );
  }

  const languages = guide.languages || [];
  const initials = (guide.user?.full_name || "G")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-charcoal/55 hover:text-forest mb-6"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-7">
              <div className="flex items-start justify-between gap-5 flex-wrap">
                <div className="flex items-start gap-5 flex-wrap">
                  <div className="w-20 h-20 rounded-full bg-forest text-white grid place-items-center font-semibold text-2xl shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-semibold text-2xl text-charcoal">
                      {guide.user?.full_name}
                    </h1>
                    {guide.is_approved && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-forest bg-forest/10 px-2.5 py-1 rounded-full">
                        <Award size={12} /> Certified
                      </span>
                    )}
                    {guide.is_available && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-sky bg-sky/10 px-2.5 py-1 rounded-full">
                        <CircleDot size={10} /> Available now
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal/55 mt-1">{guide.specialization || "General eco-tours"}</p>

                  <div className="flex items-center gap-5 mt-3 text-sm text-charcoal/60">
                    <span className="flex items-center gap-1.5">
                      <Star size={15} className="fill-gold text-gold" />
                      <strong className="text-charcoal">{guide.average_rating?.toFixed?.(1) ?? "New"}</strong>
                      {guide.total_reviews ? ` (${guide.total_reviews} reviews)` : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} /> {guide.years_experience || 0} yrs experience
                    </span>
                  </div>
                </div>
                </div>

                <FavoriteButton
                  type="guide"
                  id={guide.id}
                  initialFavorited={isFavorited}
                  size={20}
                  className="w-11 h-11 bg-soft hover:bg-red-50 shrink-0"
                />
              </div>

              {guide.bio && (
                <p className="mt-6 text-charcoal/70 leading-relaxed">{guide.bio}</p>
              )}

              {languages.length > 0 && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <Globe2 size={15} className="text-charcoal/40" />
                  {languages.map((lang) => (
                    <span key={lang} className="text-xs font-medium bg-soft text-charcoal/60 px-2.5 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <ReviewsSection
              reviews={reviews}
              loading={loadingReviews}
              targetType="guide"
              targetId={guide.id}
              onReviewAdded={(r) => setReviews((prev) => [r, ...prev])}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-28">
              <div className="mb-5">
                <span className="font-semibold text-2xl text-charcoal">
                  KSh {guide.hourly_rate?.toLocaleString?.() ?? "—"}
                </span>
                <span className="text-charcoal/45 text-sm"> /hour</span>
              </div>

              <button
                onClick={handleBookClick}
                className="w-full bg-forest text-white font-semibold rounded-xl py-3.5 hover:bg-forest-light transition-colors mb-3"
              >
                {user?.role === "guide" ? "Guides can't book guides" : "Book this guide"}
              </button>
              <button
                onClick={handleMessage}
                className="w-full flex items-center justify-center gap-2 border border-charcoal/15 text-charcoal font-semibold rounded-xl py-3.5 hover:border-forest hover:text-forest transition-colors"
              >
                <MessageCircle size={16} /> Message
              </button>

              <p className="text-xs text-charcoal/40 text-center mt-4">
                You won't be charged until the guide accepts your request.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showBooking && (
        <BookingModal
          guide={guide}
          onClose={() => setShowBooking(false)}
          onBooked={() => {}}
        />
      )}
    </div>
  );
}
