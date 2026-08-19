import { Check, Loader2, BadgeCheck } from "lucide-react";

export default function GuideApprovalsList({ guides, loading, onApprove, approvingId }) {
  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Pending guide approvals
      </h3>

      {loading && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">Loading...</p>
      )}

      {!loading && guides.length === 0 && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center flex items-center justify-center gap-2">
          <BadgeCheck size={15} className="text-forest" /> No pending approvals
        </p>
      )}

      <div className="space-y-3">
        {guides.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between gap-3 border-b border-charcoal/10 dark:border-white/10 last:border-0 pb-3 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal dark:text-white truncate">
                {g.user?.full_name || "Unnamed guide"}
              </p>
              <p className="text-xs text-charcoal/45 dark:text-white/40 truncate">
                {g.specialization || "No specialization set"} · KSh {g.hourly_rate}/hr
              </p>
            </div>
            <button
              disabled={approvingId === g.id}
              onClick={() => onApprove(g.id)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-forest/10 text-forest px-3 py-2 rounded-full hover:bg-forest hover:text-white transition-colors shrink-0 disabled:opacity-50"
            >
              {approvingId === g.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
