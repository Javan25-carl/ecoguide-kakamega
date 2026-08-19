import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function Conservation() {
  return (
    <section id="conservation" className="py-24 bg-forest relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-forest-light/20 blur-3xl" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-full bg-white/15 grid place-items-center mx-auto mb-6"
        >
          <Leaf size={26} className="text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-semibold text-2xl md:text-3xl text-white tracking-tight"
        >
          1% of every booking funds forest conservation
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-white/75 max-w-xl mx-auto"
        >
          Guide fees are set in partnership with the Kakamega Forest
          conservation program, so every trip you take helps fund reforestation,
          ranger patrols, and community guide training.
        </motion.p>
      </div>
    </section>
  );
}
