import { useState } from "react";
import { Loader2, CheckCircle2, FileCheck, X } from "lucide-react";
import ImageUploadButton from "../common/ImageUploadButton.jsx";
import api from "../../services/api.js";

const LANGUAGE_OPTIONS = ["English", "Swahili", "Luhya", "French"];

export default function GuideProfileForm({ guide, onSaved }) {
  const [form, setForm] = useState({
    bio: guide.bio || "",
    specialization: guide.specialization || "",
    languages: guide.languages || [],
    years_experience: guide.years_experience || 0,
    hourly_rate: guide.hourly_rate || 0,
    certification_url: guide.certification_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const toggleLanguage = (lang) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter((l) => l !== lang)
        : [...f.languages, lang],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put("/guides/me", form);
      onSaved?.(data.guide);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-5">
        Your guide profile
      </h3>

      <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Bio</label>
      <textarea
        rows={3}
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        placeholder="Tell tourists about your experience in the forest..."
        className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-3 mb-4 outline-none focus:border-forest"
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Specialization</label>
          <input
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            placeholder="e.g. Birdwatching & Forest Trails"
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Hourly rate (KSh)</label>
          <input
            type="number"
            min={0}
            value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>
      </div>

      <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-2">Languages spoken</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            type="button"
            key={lang}
            onClick={() => toggleLanguage(lang)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              form.languages.includes(lang)
                ? "bg-forest text-white border-forest"
                : "border-charcoal/15 dark:border-white/15 text-charcoal/60 dark:text-white/50"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Years of experience</label>
          <input
            type="number"
            min={0}
            value={form.years_experience}
            onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })}
            className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
            Certification document
          </label>
          {form.certification_url ? (
            <div className="flex items-center gap-2 text-sm rounded-xl border border-forest/30 bg-forest/5 text-forest px-3.5 py-2.5">
              <FileCheck size={16} className="shrink-0" />
              <a
                href={form.certification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate underline flex-1"
              >
                View uploaded certificate
              </a>
              <button
                type="button"
                onClick={() => setForm({ ...form, certification_url: "" })}
                className="shrink-0 text-forest/70 hover:text-forest"
                title="Remove"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ImageUploadButton
                kind="document"
                size={15}
                className="w-9 h-9 border border-charcoal/15 dark:border-white/15 text-charcoal/50 dark:text-white/45 hover:border-forest hover:text-forest"
                onUploaded={(url) => {
                  setUploadError("");
                  setForm((f) => ({ ...f, certification_url: url }));
                }}
                onError={setUploadError}
              />
              <span className="text-xs text-charcoal/45 dark:text-white/40">
                Upload a PDF or photo of your certification
              </span>
            </div>
          )}
          {uploadError && <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-forest text-white text-sm font-semibold rounded-xl px-5 py-2.5 hover:bg-forest-light transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Saving..." : "Save profile"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-forest">
            <CheckCircle2 size={15} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
