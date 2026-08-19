export default function TextField({
  label,
  icon: Icon,
  error,
  rightSlot,
  ...inputProps
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-colors ${
          error
            ? "border-red-400 bg-red-50/50"
            : "border-charcoal/15 focus-within:border-forest bg-white"
        }`}
      >
        {Icon && <Icon size={17} className="text-charcoal/40 shrink-0" />}
        <input
          {...inputProps}
          className="w-full text-sm text-charcoal placeholder:text-charcoal/35 outline-none bg-transparent"
        />
        {rightSlot}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
