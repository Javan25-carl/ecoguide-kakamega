import { motion } from "framer-motion";

const STATS = [
  { value: "40+", label: "Certified eco-guides" },
  { value: "2,600+", label: "Guided trips completed" },
  { value: "238 km²", label: "Forest under protection" },
  { value: "4.8/5", label: "Average tourist rating" },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-charcoal">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-semibold text-3xl md:text-4xl text-white">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-white/50">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
