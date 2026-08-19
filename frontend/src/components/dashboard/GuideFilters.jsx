import { SlidersHorizontal } from "lucide-react";

const LANGUAGES = ["Any language", "English", "Swahili", "Luhya", "French"];

export default function GuideFilters({ filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-charcoal/50 dark:text-white/40 text-xs font-semibold shrink-0 pr-2">
        <SlidersHorizontal size={15} /> FILTERS
      </div>

      <select
        value={filters.language}
        onChange={(e) => update({ language: e.target.value })}
        className="text-sm bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-lg px-3 py-2 outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l === "Any language" ? "" : l}>{l}</option>
        ))}
      </select>

      <select
        value={filters.maxPrice}
        onChange={(e) => update({ maxPrice: e.target.value })}
        className="text-sm bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-lg px-3 py-2 outline-none"
      >
        <option value="">Any price</option>
        <option value="1000">Up to KSh 1,000/hr</option>
        <option value="1500">Up to KSh 1,500/hr</option>
        <option value="2000">Up to KSh 2,000/hr</option>
      </select>

      <select
        value={filters.minRating}
        onChange={(e) => update({ minRating: e.target.value })}
        className="text-sm bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-lg px-3 py-2 outline-none"
      >
        <option value="">Any rating</option>
        <option value="4">4.0+ stars</option>
        <option value="4.5">4.5+ stars</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-charcoal/70 dark:text-white/60 cursor-pointer select-none ml-auto">
        <input
          type="checkbox"
          checked={filters.availableOnly}
          onChange={(e) => update({ availableOnly: e.target.checked })}
          className="w-4 h-4 rounded accent-forest"
        />
        Available now
      </label>
    </div>
  );
}
