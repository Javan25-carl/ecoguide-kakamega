import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Search, Sun, Moon, LogOut, ChevronDown, MailWarning, Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../components/common/NotificationBell.jsx";
import api from "../services/api.js";

export default function DashboardShell({ navItems, children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Support in-page anchor nav items (e.g. "/guide/dashboard#booking-requests")
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResendVerification = () => {
    setResending(true);
    api
      .post("/auth/resend-verification")
      .then(() => setResent(true))
      .finally(() => setResending(false));
  };

  return (
    <div className="min-h-screen flex bg-soft dark:bg-charcoal transition-colors">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1c262b] border-r border-charcoal/10 dark:border-white/10 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-charcoal/10 dark:border-white/10">
          <Link to="/" className="font-semibold text-charcoal dark:text-white tracking-tight">
            EcoGuide <span className="text-forest">Kakamega</span>
          </Link>
          <button className="lg:hidden text-charcoal/60 dark:text-white/60" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const [itemPath, itemHash] = item.path.split("#");
            const active =
              location.pathname === itemPath &&
              (itemHash ? location.hash === `#${itemHash}` : !location.hash);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest text-white"
                    : "text-charcoal/65 dark:text-white/60 hover:bg-forest/10 hover:text-forest"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Topbar */}
        <header className="h-20 shrink-0 bg-white dark:bg-[#1c262b] border-b border-charcoal/10 dark:border-white/10 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button className="lg:hidden text-charcoal/70 dark:text-white/70" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="font-semibold text-lg text-charcoal dark:text-white truncate">
              {title}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-soft dark:bg-white/5 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-charcoal/40 dark:text-white/40" />
            <input
              placeholder="Search attractions, guides..."
              className="w-full bg-transparent text-sm outline-none text-charcoal dark:text-white placeholder:text-charcoal/35"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-soft dark:hover:bg-white/10 text-charcoal/60 dark:text-white/60"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-soft dark:hover:bg-white/10"
              >
                <span className="w-8 h-8 rounded-full bg-forest text-white grid place-items-center text-xs font-semibold overflow-hidden">
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.[0]?.toUpperCase() || "U"
                  )}
                </span>
                <ChevronDown size={14} className="text-charcoal/40 dark:text-white/40" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1c262b] border border-charcoal/10 dark:border-white/10 rounded-xl shadow-soft py-2">
                  <div className="px-4 py-2 border-b border-charcoal/10 dark:border-white/10">
                    <p className="text-sm font-semibold text-charcoal dark:text-white truncate">{user?.full_name}</p>
                    <p className="text-xs text-charcoal/45 dark:text-white/40 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-white/5"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {user && !user.is_verified && (
          <div className="shrink-0 flex items-center justify-between gap-3 flex-wrap bg-gold/10 border-b border-gold/20 px-6 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-charcoal dark:text-white/90">
              <MailWarning size={15} className="text-gold shrink-0" />
              Verify your email to secure your account.
            </span>
            {resent ? (
              <span className="text-forest font-medium text-xs">Sent — check the server console (dev mode).</span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline disabled:opacity-60"
              >
                {resending && <Loader2 size={12} className="animate-spin" />}
                Resend verification email
              </button>
            )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
