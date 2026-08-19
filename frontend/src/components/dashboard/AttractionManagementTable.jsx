import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";

export default function AttractionManagementTable({ attractions, loading, onAdd, onEdit, onDelete, deletingId }) {
  const [confirmingId, setConfirmingId] = useState(null);

  const handleDeleteClick = (attraction) => {
    if (confirmingId === attraction.id) {
      onDelete(attraction);
      setConfirmingId(null);
    } else {
      setConfirmingId(attraction.id);
      setTimeout(() => setConfirmingId((id) => (id === attraction.id ? null : id)), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">
          Attractions ({attractions.length})
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold bg-forest text-white px-3.5 py-2 rounded-full hover:bg-forest-light transition-colors"
        >
          <Plus size={13} /> Add attraction
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && attractions.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          No attractions yet — add the first one to get tourists exploring.
        </p>
      )}

      <div className="space-y-2">
        {attractions.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-soft dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {a.cover_image_url ? (
                <img src={a.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-forest/10 grid place-items-center shrink-0 text-forest text-xs font-semibold">
                  {a.category?.[0] || "A"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal dark:text-white truncate">{a.name}</p>
                <div className="flex items-center gap-3 text-xs text-charcoal/45 dark:text-white/40">
                  <span>{a.category}</span>
                  <span>KSh {a.entrance_fee}</span>
                  {a.average_rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star size={11} className="fill-gold text-gold" /> {a.average_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit(a)}
                className="w-8 h-8 grid place-items-center rounded-full text-charcoal/50 dark:text-white/45 hover:bg-forest/10 hover:text-forest transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDeleteClick(a)}
                disabled={deletingId === a.id}
                className={`h-8 grid place-items-center rounded-full transition-colors disabled:opacity-50 ${
                  confirmingId === a.id
                    ? "px-3 bg-red-500 text-white text-xs font-semibold"
                    : "w-8 text-charcoal/50 dark:text-white/45 hover:bg-red-50 hover:text-red-500"
                }`}
                title="Delete"
              >
                {deletingId === a.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : confirmingId === a.id ? (
                  "Confirm?"
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
