import { useState } from "react";
import {
  LayoutGrid, Compass, BookMarked, MessageCircle, Heart, Settings as SettingsIcon,
  User, Lock, Loader2, CheckCircle2, Eye, EyeOff, MessageSquareText,
} from "lucide-react";
import DashboardShell from "../../layouts/DashboardShell.jsx";
import ImageUploadButton from "../../components/common/ImageUploadButton.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

const NAV_ITEMS = [
  { path: "/tourist/dashboard", label: "Dashboard", icon: LayoutGrid },
  { path: "/guides", label: "Find guides", icon: Compass },
  { path: "/tourist/bookings", label: "My bookings", icon: BookMarked },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/tourist/favorites", label: "Favorites", icon: Heart },
  { path: "/tourist/reviews", label: "My reviews", icon: MessageSquareText },
  { path: "/tourist/settings", label: "Settings", icon: SettingsIcon },
];

function ProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    profile_photo_url: user?.profile_photo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", form);
      onSaved(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <User size={16} className="text-forest" />
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">Profile</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-forest overflow-hidden shrink-0 grid place-items-center text-white font-semibold text-xl">
            {form.profile_photo_url ? (
              <img src={form.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (user?.full_name || "U")[0].toUpperCase()
            )}
          </div>
          <div>
            <ImageUploadButton
              kind="image"
              size={15}
              className="w-9 h-9 border border-charcoal/15 dark:border-white/15 text-charcoal/50 dark:text-white/45 hover:border-forest hover:text-forest"
              onUploaded={(url) => {
                setUploadError("");
                setForm((f) => ({ ...f, profile_photo_url: url }));
              }}
              onError={setUploadError}
            />
            <p className="text-xs text-charcoal/40 dark:text-white/35 mt-1">
              Click Save below after uploading a new photo.
            </p>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Full name
          </label>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Phone number
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+254 7XX XXX XXX"
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Email
          </label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full text-sm rounded-xl border border-charcoal/10 dark:border-white/10 bg-soft dark:bg-white/5 text-charcoal/50 dark:text-white/40 px-3.5 py-2.5 outline-none cursor-not-allowed"
          />
          <p className="text-xs text-charcoal/40 dark:text-white/35 mt-1">
            Email changes aren't supported yet — contact support if you need this updated.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-forest text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-forest-light transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-forest">
              <CheckCircle2 size={15} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (form.new_password.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (form.new_password !== form.confirm) {
      setError("New passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/change-password", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm({ current_password: "", new_password: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't update your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lock size={16} className="text-forest" />
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Current password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 pr-10 outline-none focus:border-forest"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-white/40"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 pr-10 outline-none focus:border-forest"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-white/40"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Confirm new password
          </label>
          <input
            type={showNew ? "text" : "password"}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-forest text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-forest-light transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Updating..." : "Update password"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-forest">
              <CheckCircle2 size={15} /> Updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default function TouristSettings() {
  const { user, setUser } = useAuth();

  return (
    <DashboardShell navItems={NAV_ITEMS} title="Settings">
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">Account settings</h2>
        <p className="text-sm text-charcoal/55 dark:text-white/45 mt-1">
          Manage your profile and password.
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        <ProfileForm user={user} onSaved={setUser} />
        <PasswordForm />
      </div>
    </DashboardShell>
  );
}
