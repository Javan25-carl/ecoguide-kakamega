import { Star, Globe2, MapPin, CircleDot } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistance } from "../../utils/geo.js";
import FavoriteButton from "../common/FavoriteButton.jsx";

export default function GuideCard({ guide, distanceKm, onBook, isFavorited }) {
  const languages = guide.languages || [];

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <Link to={`/guides/${guide.id}`} className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-forest text-white grid place-items-center font-semibold shrink-0">
            {(guide.user?.full_name || "G")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-charcoal dark:text-white text-sm truncate hover:text-forest transition-colors">
              {guide.user?.full_name || "Guide"}
            </h3>
            <p className="text-xs text-charcoal/50 dark:text-white/45 truncate">
              {guide.specialization || "General eco-tours"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <FavoriteButton type="guide" id={guide.id} initialFavorited={isFavorited} size={17} className="w-8 h-8" />
          {guide.is_available && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-forest bg-forest/10 px-2 py-1 rounded-full">
              <CircleDot size={10} /> Available
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs text-charcoal/55 dark:text-white/45">
        <span className="flex items-center gap-1">
          <Star size={13} className="fill-gold text-gold" />
          {guide.average_rating?.toFixed?.(1) ?? "New"}
          {guide.total_reviews ? ` (${guide.total_reviews})` : ""}
        </span>
        {languages.length > 0 && (
          <span className="flex items-center gap-1 truncate">
            <Globe2 size={13} /> {languages.slice(0, 2).join(", ")}
          </span>
        )}
        {distanceKm != null && (
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {formatDistance(distanceKm)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-charcoal/10 dark:border-white/10">
        <div>
          <span className="font-semibold text-charcoal dark:text-white">
            KSh {guide.hourly_rate?.toLocaleString?.() ?? "—"}
          </span>
          <span className="text-charcoal/45 dark:text-white/40 text-xs"> /hour</span>
        </div>
        <button
          onClick={() => onBook?.(guide)}
          className="text-xs font-semibold bg-forest/10 text-forest px-3.5 py-2 rounded-full hover:bg-forest hover:text-white transition-colors"
        >
          Book
        </button>
      </div>
    </div>
  );
}
