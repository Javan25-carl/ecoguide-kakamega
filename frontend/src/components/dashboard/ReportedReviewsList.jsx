import { Flag, Star, Trash2, X, Loader2 } from "lucide-react";

export default function ReportedReviewsList({ reviews, loading, onDismiss, onDelete, actingId }) {
  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm flex items-center gap-2">
          <Flag size={15} className="text-red-500" />
          Reported reviews ({reviews.length})
        </h3>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          Nothing flagged right now.
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-red-100 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/5 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < r.rating ? "fill-gold text-gold" : "text-charcoal/15 dark:text-white/15"}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-charcoal/45 dark:text-white/40 capitalize">
                {r.target_type}: {r.target_name || "Unknown"}
              </span>
            </div>

            {r.comment && (
              <p className="text-sm text-charcoal/70 dark:text-white/60 mb-2">{r.comment}</p>
            )}

            <p className="text-xs text-charcoal/45 dark:text-white/40 mb-3">
              By {r.tourist_name || "Unknown"} ·{" "}
              {new Date(r.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDismiss(r)}
                disabled={actingId === r.id}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-white/10 text-charcoal/70 dark:text-white/60 px-3 py-1.5 rounded-full hover:bg-soft dark:hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                <X size={12} /> Dismiss
              </button>
              <button
                onClick={() => onDelete(r)}
                disabled={actingId === r.id}
                className="flex items-center gap-1.5 text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={12} /> Delete review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
