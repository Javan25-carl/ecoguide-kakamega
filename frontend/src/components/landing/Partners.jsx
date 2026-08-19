const PARTNERS = [
  "Kakamega County Tourism Board",
  "Rainforest Guides Cooperative",
  "Green Trails Conservation Initiative",
  "Western Kenya Eco-Tourism Alliance",
];

export default function Partners() {
  return (
    <section className="py-16 bg-soft border-y border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-wide uppercase text-charcoal/40 mb-8">
          Working alongside
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="text-sm font-medium text-charcoal/60 bg-white px-5 py-2.5 rounded-full border border-charcoal/10"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
