import { motion } from "framer-motion";
import { Trees, Waves, Bird } from "lucide-react";

const ATTRACTIONS = [
  {
    name: "Kakamega Forest National Reserve",
    tag: "Forest",
    fee: "KSh 600",
    icon: Trees,
    gradient: "from-forest to-forest-light",
  },
  {
    name: "Isecheno Nature Trail",
    tag: "Nature Trail",
    fee: "KSh 400",
    icon: Bird,
    gradient: "from-emerald to-sky",
  },
  {
    name: "Udo Waterfalls",
    tag: "Waterfall",
    fee: "KSh 300",
    icon: Waves,
    gradient: "from-sky to-forest-light",
  },
];

export default function PopularAttractions() {
  return (
    <section id="attractions" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald">
              Popular attractions
            </span>
            <h2 className="mt-3 font-semibold text-3xl md:text-4xl tracking-tight text-charcoal">
              Where the trail leads
            </h2>
          </div>
          <a href="/attractions" className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:gap-2.5 transition-all">
            See all attractions →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ATTRACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-shadow group cursor-pointer"
              >
                <div className={`h-44 bg-gradient-to-br ${a.gradient} relative flex items-center justify-center`}>
                  <Icon size={48} className="text-white/90 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-4 left-4 text-xs font-semibold bg-white/90 text-charcoal px-3 py-1 rounded-full">
                    {a.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-charcoal">{a.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-charcoal/55">Entrance from {a.fee}</span>
                    <span className="text-sm font-semibold text-forest">Explore →</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
