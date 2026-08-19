import { motion } from "framer-motion";
import { MapPinned, UserCheck2, Footprints } from "lucide-react";

const STEPS = [
  {
    icon: MapPinned,
    label: "Mark your destination",
    text: "Tell us which trail, waterfall, or forest entrance you want to explore — or let us suggest one based on how much time you have.",
  },
  {
    icon: UserCheck2,
    label: "Match with a certified guide",
    text: "Browse verified local guides by language, specialization, and rating, or let availability near your entry point narrow it down.",
  },
  {
    icon: Footprints,
    label: "Walk in, guided by someone local",
    text: "Meet at the trailhead. Your guide handles the route, the wildlife spotting, and the stories — you just walk.",
  },
];

export default function HowItWorks() {
  return (
    <section id="trail" className="relative py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-20">
          <span className="text-xs font-semibold tracking-wide uppercase text-emerald">
            The route
          </span>
          <h2 className="mt-3 font-semibold text-3xl md:text-4xl tracking-tight text-charcoal">
            Three steps, one footpath
          </h2>
        </div>

        <div className="relative">
          {/* Dotted trail path connecting steps — desktop only */}
          <svg
            className="hidden md:block absolute top-8 left-0 w-full"
            height="24"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M100,12 Q300,-10 400,12 T700,12 T1100,12"
              stroke="#FFC107"
              strokeWidth="3"
              strokeDasharray="2 14"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </svg>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-forest text-white grid place-items-center shadow-soft relative z-10">
                    <Icon size={26} />
                  </div>
                  <span className="absolute top-1 left-14 text-xs font-bold text-gold bg-white px-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-semibold text-xl text-charcoal">
                    {step.label}
                  </h3>
                  <p className="mt-2 text-charcoal/60 text-[15px] leading-relaxed">
                    {step.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
