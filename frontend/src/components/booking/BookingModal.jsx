import { useState, useMemo } from "react";
import { X, Calendar, Clock, Users2, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../services/api.js";

export default function BookingModal({ guide, attraction, onClose, onBooked }) {
  const [form, setForm] = useState({
    trip_date: "",
    start_time: "",
    duration_hours: 2,
    number_of_people: 2,
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const estimatedPrice = useMemo(
    () => Math.round((guide.hourly_rate || 0) * (Number(form.duration_hours) || 0)),
    [guide.hourly_rate, form.duration_hours]
  );

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.trip_date) {
      setError("Pick a trip date");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/bookings/", {
        guide_id: guide.id,
        attraction_id: attraction?.id,
        trip_date: form.trip_date,
        start_time: form.start_time || undefined,
        duration_hours: Number(form.duration_hours),
        number_of_people: Number(form.number_of_people),
        notes: form.notes || undefined,
      });
      setDone(true);
      onBooked?.(data.booking);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't create that booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6">
      <div className="bg-white dark:bg-[#1c262b] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-soft max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-charcoal/10 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c262b] z-10">
          <h3 className="font-semibold text-charcoal dark:text-white">
            {done ? "Request sent" : `Book ${guide.user?.full_name || "guide"}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-soft dark:hover:bg-white/10 text-charcoal/50 dark:text-white/50"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-forest/10 grid place-items-center mb-4">
              <CheckCircle2 size={26} className="text-forest" />
            </div>
            <p className="text-sm text-charcoal/70 dark:text-white/60 max-w-xs">
              Your request for <strong>{form.trip_date}</strong> has been sent to{" "}
              {guide.user?.full_name}. You'll get a notification once they respond —
              track it any time under My Bookings.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-forest text-white text-sm font-semibold rounded-xl px-6 py-2.5 hover:bg-forest-light transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
                  <Calendar size={13} /> Trip date
                </label>
                <input
                  type="date"
                  min={today}
                  required
                  value={form.trip_date}
                  onChange={(e) => setForm({ ...form, trip_date: e.target.value })}
                  className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3 py-2.5 outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
                  <Clock size={13} /> Start time
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3 py-2.5 outline-none focus:border-forest"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={0.5}
                  value={form.duration_hours}
                  onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
                  className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3 py-2.5 outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
                  <Users2 size={13} /> Group size
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.number_of_people}
                  onChange={(e) => setForm({ ...form, number_of_people: e.target.value })}
                  className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3 py-2.5 outline-none focus:border-forest"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60 dark:text-white/45 mb-1.5">
                <MessageSquare size={13} /> Notes for your guide (optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything they should know — mobility needs, interests, pickup point..."
                className="w-full text-sm rounded-xl border border-charcoal/15 dark:border-white/15 bg-white dark:bg-white/5 text-charcoal dark:text-white px-3.5 py-2.5 outline-none focus:border-forest"
              />
            </div>

            <div className="flex items-center justify-between bg-soft dark:bg-white/5 rounded-xl px-4 py-3">
              <span className="text-sm text-charcoal/60 dark:text-white/50">Estimated total</span>
              <span className="font-semibold text-lg text-charcoal dark:text-white">
                KSh {estimatedPrice.toLocaleString()}
              </span>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-forest text-white font-semibold rounded-xl py-3.5 hover:bg-forest-light transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Sending request..." : "Send booking request"}
            </button>
            <p className="text-xs text-charcoal/40 dark:text-white/35 text-center">
              This sends a request — your guide has to accept before it's confirmed.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
