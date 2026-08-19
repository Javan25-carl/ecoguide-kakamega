import { useState, useEffect } from "react";
import { Star, Loader2, X, CalendarCheck, ThumbsUp, Flag, Check } from "lucide-react";
import ImageUploadButton from "../common/ImageUploadButton.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

function ReviewItem({ review, onUpdate }) {
  const { user } = useAuth();
  const [liking, setLiking] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/reviews/${review.id}/like`);
      onUpdate(review.id, { likes_count: data.likes_count, liked_by_me: data.liked });
    } finally {
      setLiking(false);
    }
  };

  const handleReport = async () => {
    if (!user || reporting || reported) return;
    if (!window.confirm("Report this review as inappropriate? An admin will take a look.")) return;
    setReporting(true);
    try {
      await api.post(`/reviews/${review.id}/report`);
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="pb-5 border-b border-charcoal/10 dark:border-white/10 last:border-0 last:pb-0">
      <div className="flex items-center gap-1 mb-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < review.rating ? "fill-gold text-gold" : "text-charcoal/15 dark:text-white/15"}
          />
        ))}
        <span className="text-xs text-charcoal/40 dark:text-white/35 ml-1">
          {new Date(review.created_at).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
        </span>
      </div>

      {review.comment && (
        <p className="text-sm text-charcoal/70 dark:text-white/60">{review.comment}</p>
      )}

      {review.photo_urls?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {review.photo_urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt="Review"
                className="w-16 h-16 rounded-lg object-cover hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      {user && (
        <div className="flex items-center gap-4 mt-2.5">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              review.liked_by_me
                ? "text-forest"
                : "text-charcoal/45 dark:text-white/40 hover:text-forest"
            }`}
          >
            <ThumbsUp size={13} className={review.liked_by_me ? "fill-forest/20" : ""} />
            {review.likes_count > 0 ? review.likes_count : "Helpful"}
          </button>

          <button
            onClick={handleReport}
            disabled={reporting || reported}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
              reported ? "text-charcoal/35 dark:text-white/30" : "text-charcoal/45 dark:text-white/40 hover:text-red-500"
            }`}
          >
            {reported ? <Check size={13} /> : <Flag size={13} />}
            {reported ? "Reported" : "Report"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewsSection({ reviews, loading, targetType, targetId, onReviewAdded }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Guide reviews must be tied to a completed booking - see backend
  // review_routes.py. Attraction reviews don't have this requirement
  // (visiting an attraction doesn't necessarily go through a booking).
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loadingEligibility, setLoadingEligibility] = useState(targetType === "guide");
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const canReview = user && user.role === "tourist";
  const requiresBooking = targetType === "guide";

  const [localReviews, setLocalReviews] = useState(reviews);
  useEffect(() => setLocalReviews(reviews), [reviews]);

  const handleReviewUpdate = (reviewId, patch) => {
    setLocalReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...patch } : r)));
  };

  useEffect(() => {
    if (!canReview || !requiresBooking) {
      setLoadingEligibility(false);
      return;
    }
    setLoadingEligibility(true);
    api
      .get(`/bookings/reviewable/${targetId}`)
      .then(({ data }) => {
        const bookings = data.bookings || [];
        setEligibleBookings(bookings);
        setSelectedBookingId(bookings[0]?.id || "");
      })
      .catch(() => setEligibleBookings([]))
      .finally(() => setLoadingEligibility(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, canReview, requiresBooking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Pick a star rating first");
      return;
    }
    if (requiresBooking && !selectedBookingId) {
      setError("Pick which trip you're reviewing");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment: comment.trim() || undefined,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        [targetType === "guide" ? "guide_id" : "attraction_id"]: targetId,
        ...(requiresBooking ? { booking_id: selectedBookingId } : {}),
      };
      const { data } = await api.post("/reviews/", payload);
      onReviewAdded?.(data.review);
      setRating(0);
      setComment("");
      setPhotoUrls([]);
      if (requiresBooking) {
        setEligibleBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
        setSelectedBookingId("");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const showForm = canReview && (!requiresBooking || eligibleBookings.length > 0);
  const showNoEligibleMessage =
    canReview && requiresBooking && !loadingEligibility && eligibleBookings.length === 0;

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white mb-5">
        Reviews {localReviews.length > 0 && `(${localReviews.length})`}
      </h3>

      {loadingEligibility && requiresBooking && (
        <p className="text-sm text-charcoal/40 dark:text-white/35 mb-4">Checking your trips...</p>
      )}

      {showNoEligibleMessage && (
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-charcoal/10 dark:border-white/10 text-sm text-charcoal/55 dark:text-white/45">
          <CalendarCheck size={18} className="text-charcoal/30 dark:text-white/30 shrink-0" />
          You can review this guide once you've completed a trip together.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-charcoal/10 dark:border-white/10">
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-2">
            Leave a review
          </label>

          {requiresBooking && eligibleBookings.length > 1 && (
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest mb-3"
            >
              {eligibleBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Trip on {b.trip_date}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                type="button"
                key={i}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  size={22}
                  className={
                    i < (hoverRating || rating)
                      ? "fill-gold text-gold"
                      : "text-charcoal/20 dark:text-white/20"
                  }
                />
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share how the experience went..."
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest mb-3"
          />

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {photoUrls.map((url) => (
              <div key={url} className="relative w-14 h-14 rounded-lg overflow-hidden group">
                <img src={url} alt="Review upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 grid place-items-center text-white transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <ImageUploadButton
              kind="image"
              size={15}
              className="w-14 h-14 border border-dashed border-charcoal/20 dark:border-white/20 text-charcoal/40 dark:text-white/35 hover:border-forest hover:text-forest"
              onUploaded={(url) => {
                setUploadError("");
                setPhotoUrls((prev) => [...prev, url]);
              }}
              onError={setUploadError}
            />
          </div>
          {uploadError && <p className="text-sm text-red-500 mb-3">{uploadError}</p>}

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-forest text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-forest-light transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Posting..." : "Post review"}
          </button>
        </form>
      )}

      {loading && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">Loading reviews...</p>
      )}

      {!loading && localReviews.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          No reviews yet — be the first to share your experience.
        </p>
      )}

      <div className="space-y-5">
        {localReviews.map((r) => (
          <ReviewItem key={r.id} review={r} onUpdate={handleReviewUpdate} />
        ))}
      </div>
    </div>
  );
}
