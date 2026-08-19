import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Form side */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <a href="/" className="flex items-center gap-2 mb-12">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-forest text-white">
            <Leaf size={18} />
          </span>
          <span className="font-semibold text-lg tracking-tight text-charcoal">
            EcoGuide <span className="text-forest">Kakamega</span>
          </span>
        </a>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto lg:mx-0"
        >
          <h1 className="font-semibold text-2xl md:text-3xl text-charcoal tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-charcoal/55 text-sm">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>

      {/* Illustration side */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-b from-forest to-[#1B4D1E]">
        <div className="absolute top-16 right-16 w-64 h-64 rounded-full bg-gold/15 blur-3xl" />

        <svg
          viewBox="0 0 700 900"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,650 C100,600 180,660 280,610 C380,560 460,630 560,590 C620,565 660,600 700,580 L700,900 L0,900 Z"
            fill="#66BB6A"
            opacity="0.25"
          />
          <path
            d="M0,720 C120,670 220,730 340,690 C460,650 560,710 700,670 L700,900 L0,900 Z"
            fill="#4CAF50"
            opacity="0.4"
          />
          <path
            d="M0,800 C140,760 260,810 400,780 C540,750 620,800 700,780 L700,900 L0,900 Z"
            fill="#2E7D32"
          />
        </svg>

        <div className="relative z-10 h-full flex flex-col justify-center px-16 text-white max-w-lg">
          <blockquote className="text-2xl font-medium leading-snug">
            "Our guide spotted a De Brazza's monkey within ten minutes of
            entering the reserve — something we'd never have found on our own."
          </blockquote>
          <p className="mt-5 text-white/60 text-sm">
            Amara D. · Visited from Lagos
          </p>
        </div>
      </div>
    </div>
  );
}
