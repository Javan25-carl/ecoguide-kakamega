export default function StatCard({ icon: Icon, label, value, accent = "forest" }) {
  const accentClasses = {
    forest: "bg-forest/10 text-forest",
    emerald: "bg-emerald/10 text-emerald",
    sky: "bg-sky/10 text-sky",
    gold: "bg-gold/15 text-gold",
    red: "bg-red-100 text-red-500",
  };

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${accentClasses[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-xl text-charcoal dark:text-white truncate">
          {value}
        </div>
        <div className="text-xs text-charcoal/50 dark:text-white/40 truncate">{label}</div>
      </div>
    </div>
  );
}
