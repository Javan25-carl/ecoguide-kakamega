import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users2 } from "lucide-react";

function CanopyLayer({ fill, opacity, delay, d }) {
  return (
    <motion.path
      d={d}
      fill={fill}
      opacity={opacity}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity }}
      transition={{ duration: 1.1, delay, ease: "easeOut" }}
    />
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [groupSize, setGroupSize] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (date) params.set("date", date);
    if (groupSize) params.set("people", groupSize);
    navigate(`/attractions${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF6EC] via-[#F5F5F5] to-white pt-20">
      {/* Ambient sun glow */}
      <div className="absolute top-24 right-[8%] w-72 h-72 rounded-full bg-gold/25 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-8 relative z-10">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-6"
          >
            Kenya's last tropical rainforest
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-charcoal"
          >
            Walk the forest with
            <br />
            someone who knows
            <br />
            <span className="text-forest">every trail by name.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-charcoal/70 max-w-lg"
          >
            EcoGuide Kakamega connects you with certified local guides who've
            spent their lives in this canopy — for a trip that's safer,
            richer, and actually funds the forest you came to see.
          </motion.p>
        </div>

        {/* Search card */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 bg-white rounded-2xl shadow-soft p-3 md:p-4 flex flex-col md:flex-row gap-2 max-w-3xl"
        >
          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl hover:bg-soft transition-colors">
            <MapPin size={18} className="text-forest shrink-0" />
            <div className="w-full">
              <label className="block text-xs font-medium text-charcoal/50">Where to</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Kakamega Forest, Isecheno, Udo..."
                className="w-full text-sm font-medium text-charcoal placeholder:text-charcoal/30 outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="hidden md:block w-px bg-charcoal/10 my-2" />

          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl hover:bg-soft transition-colors">
            <Calendar size={18} className="text-forest shrink-0" />
            <div className="w-full">
              <label className="block text-xs font-medium text-charcoal/50">When</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm font-medium text-charcoal outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="hidden md:block w-px bg-charcoal/10 my-2" />

          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl hover:bg-soft transition-colors">
            <Users2 size={18} className="text-forest shrink-0" />
            <div className="w-full">
              <label className="block text-xs font-medium text-charcoal/50">Group size</label>
              <input
                type="number"
                min={1}
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full text-sm font-medium text-charcoal outline-none bg-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-forest text-white font-semibold rounded-xl px-6 py-3.5 hover:bg-forest-light transition-colors shrink-0"
          >
            <Search size={17} />
            Search
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-charcoal/50"
        >
          <span><strong className="text-charcoal">40+</strong> certified guides</span>
          <span><strong className="text-charcoal">238 km²</strong> of protected forest</span>
          <span><strong className="text-charcoal">4.8/5</strong> average trip rating</span>
        </motion.div>
      </div>

      {/* Layered canopy silhouette, back to front */}
      <div className="relative h-40 md:h-56 mt-6">
        <svg
          viewBox="0 0 1440 220"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <CanopyLayer
            fill="#66BB6A"
            opacity={0.35}
            delay={0.5}
            d="M0,140 C120,90 240,170 360,120 C480,70 600,150 720,110 C840,70 960,160 1080,120 C1200,80 1320,150 1440,110 L1440,220 L0,220 Z"
          />
          <CanopyLayer
            fill="#4CAF50"
            opacity={0.55}
            delay={0.65}
            d="M0,170 C140,120 260,190 400,150 C540,110 660,180 800,140 C940,100 1060,180 1200,150 C1300,130 1380,160 1440,150 L1440,220 L0,220 Z"
          />
          <CanopyLayer
            fill="#2E7D32"
            opacity={1}
            delay={0.8}
            d="M0,200 C160,160 300,210 460,180 C620,150 760,205 920,175 C1080,145 1220,205 1440,180 L1440,220 L0,220 Z"
          />
        </svg>
      </div>
    </section>
  );
}
