import { useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import ImageUploadButton from "../common/ImageUploadButton.jsx";
import api from "../../services/api.js";

const CATEGORIES = ["Forest", "Nature Trail", "Waterfall"];

const emptyForm = {
  name: "",
  description: "",
  history: "",
  category: "Forest",
  lat: "",
  lng: "",
  entrance_fee: 0,
  opening_hours: "",
  best_time_to_visit: "",
  cover_image_url: "",
  gallery_urls: [],
};

export default function AttractionFormModal({ attraction, onClose, onSaved }) {
  const isEdit = Boolean(attraction);
  const [form, setForm] = useState(
    attraction
      ? {
          name: attraction.name || "",
          description: attraction.description || "",
          history: attraction.history || "",
          category: attraction.category || "Forest",
          lat: attraction.lat ?? "",
          lng: attraction.lng ?? "",
          entrance_fee: attraction.entrance_fee ?? 0,
          opening_hours: attraction.opening_hours || "",
          best_time_to_visit: attraction.best_time_to_visit || "",
          cover_image_url: attraction.cover_image_url || "",
          gallery_urls: attraction.gallery_urls || [],
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.description.trim() || form.lat === "" || form.lng === "") {
      setError("Name, description, latitude, and longitude are required.");
      return;
    }

    const payload = {
      ...form,
      lat: Number(form.lat),
      lng: Number(form.lng),
      entrance_fee: Number(form.entrance_fee) || 0,
    };

    setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/attractions/${attraction.id}`, payload)
        : await api.post("/attractions/", payload);
      onSaved(data.attraction);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't save this attraction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6">
      <div className="bg-white dark:bg-[#1c262b] w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-soft max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-charcoal/10 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c262b] z-10">
          <h3 className="font-semibold text-charcoal dark:text-white">
            {isEdit ? "Edit attraction" : "Add attraction"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-soft dark:hover:bg-white/10 text-charcoal/50 dark:text-white/50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">History (optional)</label>
            <textarea
              rows={2}
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Entrance fee (KSh)</label>
              <input
                type="number"
                min={0}
                value={form.entrance_fee}
                onChange={(e) => setForm({ ...form, entrance_fee: e.target.value })}
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Opening hours</label>
              <input
                value={form.opening_hours}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                placeholder="6:00 AM - 6:00 PM"
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Best time to visit</label>
              <input
                value={form.best_time_to_visit}
                onChange={(e) => setForm({ ...form, best_time_to_visit: e.target.value })}
                placeholder="June - September"
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Cover image</label>
            {form.cover_image_url ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cover_image_url: "" })}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 grid place-items-center text-white transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <ImageUploadButton
                kind="image"
                size={15}
                className="w-10 h-10 border border-dashed border-charcoal/20 dark:border-white/20 text-charcoal/40 dark:text-white/35 hover:border-forest hover:text-forest"
                onUploaded={(url) => {
                  setUploadError("");
                  setForm((f) => ({ ...f, cover_image_url: url }));
                }}
                onError={setUploadError}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">Gallery</label>
            <div className="flex items-center gap-2 flex-wrap">
              {form.gallery_urls.map((url) => (
                <div key={url} className="relative w-14 h-14 rounded-lg overflow-hidden group">
                  <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((u) => u !== url) }))
                    }
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 grid place-items-center text-white transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <ImageUploadButton
                kind="image"
                size={14}
                className="w-14 h-14 border border-dashed border-charcoal/20 dark:border-white/20 text-charcoal/40 dark:text-white/35 hover:border-forest hover:text-forest"
                onUploaded={(url) => {
                  setUploadError("");
                  setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, url] }));
                }}
                onError={setUploadError}
              />
            </div>
          </div>

          {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-forest text-white font-semibold rounded-xl py-3.5 hover:bg-forest-light transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create attraction"}
          </button>
        </form>
      </div>
    </div>
  );
}
