export default function PriceBreakdown({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between text-charcoal/60 dark:text-white/45">
        <span>Guide rate</span>
        <span>KSh {breakdown.guide_hourly_rate?.toLocaleString?.() ?? 0}/hr</span>
      </div>
      <div className="flex items-center justify-between text-charcoal/60 dark:text-white/45">
        <span>Duration</span>
        <span>{breakdown.duration_hours}h</span>
      </div>
      <div className="flex items-center justify-between text-charcoal/60 dark:text-white/45 pb-2 border-b border-charcoal/10 dark:border-white/10">
        <span>Subtotal</span>
        <span>KSh {breakdown.subtotal?.toLocaleString?.() ?? 0}</span>
      </div>
      {breakdown.discount > 0 && (
        <div className="flex items-center justify-between text-forest">
          <span>Discount</span>
          <span>-KSh {breakdown.discount.toLocaleString()}</span>
        </div>
      )}
      <div className="flex items-center justify-between font-semibold text-charcoal dark:text-white pt-1">
        <span>Total</span>
        <span>KSh {breakdown.total?.toLocaleString?.() ?? 0}</span>
      </div>
    </div>
  );
}
