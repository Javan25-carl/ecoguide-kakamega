import { Leaf, Facebook, Instagram, Twitter } from "lucide-react";

const COLUMNS = [
  {
    title: "Explore",
    links: ["Attractions", "Guides", "Nature trails", "Trip ideas"],
  },
  {
    title: "For guides",
    links: ["Become a guide", "Certification", "Guide dashboard", "Payouts"],
  },
  {
    title: "Company",
    links: ["About EcoGuide", "Conservation impact", "Careers", "Press"],
  },
  {
    title: "Support",
    links: ["Help center", "Safety", "Cancellation policy", "Contact us"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/70 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-6 gap-10 pb-14 border-b border-white/10">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-forest-light text-white">
                <Leaf size={18} />
              </span>
              <span className="font-semibold text-lg text-white">
                EcoGuide Kakamega
              </span>
            </a>
            <p className="mt-4 text-sm max-w-xs">
              Connecting tourists with certified eco-guides across Kakamega
              County, for trips that respect the forest they explore.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 grid place-items-center hover:bg-forest-light transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} EcoGuide Kakamega. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70">Privacy policy</a>
            <a href="#" className="hover:text-white/70">Terms of service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
