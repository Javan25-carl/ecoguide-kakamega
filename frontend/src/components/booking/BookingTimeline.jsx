import { CheckCircle2, Circle, XCircle } from "lucide-react";

// The full "happy path" sequence. A given booking only ever actually
// passes through a subset of these (e.g. a rejected booking never
// reaches "completed") - the component below figures out which steps
// actually happened from the real status_history rows, rather than
// rendering this whole list as if every booking follows it.
const STEPS = [
  { status: "pending", label: "Booking requested" },
  { status: "accepted", label: "Guide accepted" },
  { status: "completed", label: "Trip completed" },
];

const TERMINAL_NEGATIVE = ["rejected", "cancelled"];

export default function BookingTimeline({ statusHistory, currentStatus }) {
  const historyByStatus = {};
  for (const h of statusHistory || []) {
    // Keep the first time we hit each status (a reschedule logs a repeat
    // "pending" row with a note, which we don't want to treat as a new step)
    if (!historyByStatus[h.status]) historyByStatus[h.status] = h;
  }

  const wasRejectedOrCancelled = TERMINAL_NEGATIVE.includes(currentStatus);
  const negativeEntry = wasRejectedOrCancelled ? historyByStatus[currentStatus] : null;

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        // Once a booking is rejected/cancelled, don't show later happy-path
        // steps as "upcoming" - the trip isn't happening, full stop.
        const stepOrder = ["pending", "accepted", "completed"].indexOf(step.status);
        const currentOrder = ["pending", "accepted", "completed"].indexOf(currentStatus);
        const isPast = historyByStatus[step.status] != null;
        const isCut = wasRejectedOrCancelled && stepOrder > (currentOrder === -1 ? 0 : currentOrder);

        if (isCut) return null;

        const entry = historyByStatus[step.status];
        const isLast = i === STEPS.length - 1 || (wasRejectedOrCancelled && stepOrder === currentOrder);

        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isPast ? (
                <CheckCircle2 size={18} className="text-forest shrink-0" />
              ) : (
                <Circle size={18} className="text-charcoal/20 dark:text-white/20 shrink-0" />
              )}
              {!isLast && <div className="w-px flex-1 min-h-[24px] bg-charcoal/10 dark:bg-white/10 my-1" />}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isPast ? "text-charcoal dark:text-white" : "text-charcoal/40 dark:text-white/35"}`}>
                {step.label}
              </p>
              {entry && (
                <p className="text-xs text-charcoal/45 dark:text-white/40 mt-0.5">
                  {new Date(entry.created_at).toLocaleString("en-KE", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                  {entry.note && ` · ${entry.note}`}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {negativeEntry && (
        <div className="flex gap-3">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-500 capitalize">{currentStatus}</p>
            <p className="text-xs text-charcoal/45 dark:text-white/40 mt-0.5">
              {new Date(negativeEntry.created_at).toLocaleString("en-KE", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
              {negativeEntry.note && ` · ${negativeEntry.note}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
