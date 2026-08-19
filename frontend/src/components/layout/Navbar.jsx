import { useState, useEffect } from "react";
import { Leaf, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Explore", href: "#trail" },
  { label: "Guides", href: "#guides" },
  { label: "Attractions", href: "#attractions" },
  { label: "Conservation", href: "#conservation" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-forest text-white">
            <Leaf size={18} />
          </span>
          <span className="font-semibold text-lg tracking-tight text-charcoal">
            EcoGuide <span className="text-forest">Kakamega</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-charcoal/70 hover:text-forest transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-charcoal/80 hover:text-forest px-4 py-2 transition-colors"
          >
            Log in
          </a>
          <a
            href="/register"
            className="text-sm font-semibold bg-forest text-white px-5 py-2.5 rounded-full hover:bg-forest-light transition-colors shadow-soft"
          >
            Get started
          </a>
        </div>

        <button
          className="md:hidden p-2 text-charcoal"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-charcoal/10 px-6 py-5 flex flex-col gap-4">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-charcoal/80"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <a href="/login" className="flex-1 text-center text-sm font-medium border border-charcoal/15 rounded-full py-2.5">
              Log in
            </a>
            <a href="/register" className="flex-1 text-center text-sm font-semibold bg-forest text-white rounded-full py-2.5">
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
