import { Star, Loader2 } from "lucide-react";

export default function ReviewsList({ reviews, loading }) {
  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Recent reviews
      </h3>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          No reviews yet.
        </p>
      )}

      <div className="space-y-4">
        {reviews.slice(0, 5).map((r) => (
          <div key={r.id} className="border-b border-charcoal/10 dark:border-white/10 last:border-0 pb-4 last:pb-0">
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < r.rating ? "fill-gold text-gold" : "text-charcoal/15 dark:text-white/15"}
                />
              ))}
            </div>
            {r.comment && (
              <p className="text-sm text-charcoal/70 dark:text-white/60">{r.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
