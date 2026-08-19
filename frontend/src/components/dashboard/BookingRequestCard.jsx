import { Check, X, Calendar, Users2, Loader2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  accepted: "bg-forest/15 text-forest",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-charcoal/10 text-charcoal/50",
  completed: "bg-sky/15 text-sky",
};

const PAYMENT_STYLE = {
  unpaid: "bg-charcoal/10 text-charcoal/50 dark:bg-white/10 dark:text-white/50",
  paid: "bg-forest/15 text-forest",
};

export default function BookingRequestCard({ booking, onUpdateStatus, updating }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-charcoal/10 dark:border-white/10 last:border-0 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-charcoal dark:text-white flex-wrap">
          <Calendar size={15} className="text-charcoal/40 dark:text-white/40 shrink-0" />
          {booking.trip_date}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              STATUS_STYLE[booking.status] || "bg-charcoal/10 text-charcoal/50"
            }`}
          >
            {booking.status}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
              PAYMENT_STYLE[booking.payment_status] || PAYMENT_STYLE.unpaid
            }`}
          >
            {booking.payment_status || "unpaid"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50 dark:text-white/40 mt-1">
          <Users2 size={13} />
          {booking.number_of_people} {booking.number_of_people === 1 ? "person" : "people"} · {booking.duration_hours}h
          · KSh {booking.total_price?.toLocaleString?.()}
          <span className="font-mono text-charcoal/30 dark:text-white/25">#{booking.id?.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {booking.status === "pending" && (
          <>
            <button
              disabled={updating}
              onClick={() => onUpdateStatus(booking.id, "accepted")}
              className="w-9 h-9 grid place-items-center rounded-full bg-forest/10 text-forest hover:bg-forest hover:text-white transition-colors disabled:opacity-50"
              title="Accept"
            >
              {updating ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            </button>
            <Link
              to={`/bookings/${booking.id}`}
              className="w-9 h-9 grid place-items-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              title="Reject (with a reason)"
            >
              <X size={15} />
            </Link>
          </>
        )}

        {booking.status === "accepted" && (
          <button
            disabled={updating}
            onClick={() => onUpdateStatus(booking.id, "completed")}
            className="text-xs font-semibold bg-sky/15 text-sky px-3 py-2 rounded-full hover:bg-sky hover:text-white transition-colors disabled:opacity-50"
          >
            Mark completed
          </button>
        )}

        <Link
          to={`/bookings/${booking.id}`}
          className="w-9 h-9 grid place-items-center rounded-full text-charcoal/40 dark:text-white/35 hover:bg-soft dark:hover:bg-white/10 hover:text-forest transition-colors"
          title="View details"
        >
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
