import { Calendar, Loader2 } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  accepted: "bg-forest/15 text-forest",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-charcoal/10 text-charcoal/50",
  completed: "bg-sky/15 text-sky",
};

export default function UpcomingBookings({ bookings, loading }) {
  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">
          Your bookings
        </h3>
        <Calendar size={16} className="text-charcoal/40 dark:text-white/40" />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
          No bookings yet — find a guide and request a trip.
        </p>
      )}

      <div className="space-y-3">
        {bookings.slice(0, 5).map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between border-b border-charcoal/10 dark:border-white/10 last:border-0 pb-3 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-charcoal dark:text-white">
                {b.trip_date}
              </p>
              <p className="text-xs text-charcoal/45 dark:text-white/40">
                {b.number_of_people} {b.number_of_people === 1 ? "person" : "people"} · {b.duration_hours}h
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                STATUS_STYLE[b.status] || "bg-charcoal/10 text-charcoal/50"
              }`}
            >
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
