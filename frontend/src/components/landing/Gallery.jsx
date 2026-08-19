import { motion } from "framer-motion";

const TILES = [
  { gradient: "from-forest to-forest-light", tall: true },
  { gradient: "from-emerald to-sky", tall: false },
  { gradient: "from-sky to-forest", tall: false },
  { gradient: "from-forest-light to-emerald", tall: false },
  { gradient: "from-charcoal to-forest", tall: true },
  { gradient: "from-gold/80 to-forest-light", tall: false },
];

export default function Gallery() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-14">
          <span className="text-xs font-semibold tracking-wide uppercase text-emerald">
            Gallery
          </span>
          <h2 className="mt-3 font-semibold text-3xl md:text-4xl tracking-tight text-charcoal">
            Glimpses of the canopy
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TILES.map((tile, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`rounded-2xl bg-gradient-to-br ${tile.gradient} ${
                tile.tall ? "row-span-2 h-full min-h-[280px]" : "h-[130px]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
