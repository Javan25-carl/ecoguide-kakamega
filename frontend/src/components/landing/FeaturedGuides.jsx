import { motion } from "framer-motion";
import { Star, Globe2, ArrowUpRight } from "lucide-react";

const GUIDES = [
  {
    name: "Wanjiru Otieno",
    initials: "WO",
    specialty: "Birdwatching & Forest Trails",
    languages: ["English", "Swahili", "Luhya"],
    rating: 4.8,
    reviews: 32,
    rate: 1500,
    color: "bg-forest",
  },
  {
    name: "Brian Shikanga",
    initials: "BS",
    specialty: "Primates & Night Walks",
    languages: ["English", "Swahili"],
    rating: 4.9,
    reviews: 51,
    rate: 1800,
    color: "bg-emerald",
  },
  {
    name: "Ashley Nafula",
    initials: "AN",
    specialty: "Botany & Waterfall Trails",
    languages: ["English", "French", "Luhya"],
    rating: 4.7,
    reviews: 24,
    rate: 1350,
    color: "bg-sky",
  },
];

export default function FeaturedGuides() {
  return (
    <section id="guides" className="py-28 bg-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald">
              Featured guides
            </span>
            <h2 className="mt-3 font-semibold text-3xl md:text-4xl tracking-tight text-charcoal">
              People, not itineraries
            </h2>
          </div>
          <a href="/guides" className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:gap-2.5 transition-all">
            See all guides <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {GUIDES.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full ${g.color} text-white grid place-items-center font-semibold text-lg shrink-0`}>
                  {g.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal">{g.name}</h3>
                  <p className="text-sm text-charcoal/55">{g.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-4 text-sm">
                <Star size={15} className="fill-gold text-gold" />
                <span className="font-semibold text-charcoal">{g.rating}</span>
                <span className="text-charcoal/45">({g.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-charcoal/55">
                <Globe2 size={15} />
                {g.languages.join(", ")}
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-charcoal/10">
                <div>
                  <span className="font-semibold text-lg text-charcoal">
                    KSh {g.rate.toLocaleString()}
                  </span>
                  <span className="text-charcoal/45 text-sm"> /hour</span>
                </div>
                <button className="text-sm font-semibold bg-forest/10 text-forest px-4 py-2 rounded-full hover:bg-forest hover:text-white transition-colors">
                  View profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
