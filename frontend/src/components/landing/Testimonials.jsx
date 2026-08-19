import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Amara D.",
    origin: "Visited from Lagos",
    quote: "Our guide spotted a De Brazza's monkey within ten minutes of entering the reserve — something we'd never have found on our own.",
  },
  {
    name: "Tom H.",
    origin: "Visited from Bristol",
    quote: "Booking took two minutes and the guide was waiting for us at the exact trailhead, on time, with a first-aid kit and local knowledge to match.",
  },
  {
    name: "Faith M.",
    origin: "Visited from Nairobi",
    quote: "Knowing part of the fee goes back into the reserve made the whole trip feel worth doing right, not just doing.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-14">
          <span className="text-xs font-semibold tracking-wide uppercase text-emerald">
            From the trail
          </span>
          <h2 className="mt-3 font-semibold text-3xl md:text-4xl tracking-tight text-charcoal">
            What visitors say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-7 shadow-card"
            >
              <Quote size={22} className="text-gold" />
              <p className="mt-4 text-charcoal/75 leading-relaxed text-[15px]">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-5 border-t border-charcoal/10">
                <div className="font-semibold text-charcoal text-sm">{t.name}</div>
                <div className="text-charcoal/50 text-sm">{t.origin}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
