import { useState } from "react";
import { CircleDot, MapPinned, Loader2 } from "lucide-react";
import api from "../../services/api.js";

export default function AvailabilityCard({ guide, onUpdated }) {
  const [toggling, setToggling] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await api.put("/guides/me/availability", {
        is_available: !guide.is_available,
      });
      onUpdated?.({ ...guide, is_available: data.is_available });
    } finally {
      setToggling(false);
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await api.put("/guides/me/location", { lat: latitude, lng: longitude });
        onUpdated?.({ ...guide, current_lat: latitude, current_lng: longitude });
        setSharing(false);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      },
      () => setSharing(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Availability
      </h3>

      <button
        onClick={toggleAvailability}
        disabled={toggling}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors mb-3 ${
          guide.is_available
            ? "bg-forest/10 border-forest text-forest"
            : "border-charcoal/15 dark:border-white/15 text-charcoal/60 dark:text-white/50"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <CircleDot size={15} />
          {guide.is_available ? "Available for bookings" : "Not available"}
        </span>
        {toggling ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <span className="text-xs">Tap to toggle</span>
        )}
      </button>

      <button
        onClick={shareLocation}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-sky/10 text-sky px-4 py-3 rounded-xl hover:bg-sky hover:text-white transition-colors disabled:opacity-60"
      >
        {sharing ? <Loader2 size={15} className="animate-spin" /> : <MapPinned size={15} />}
        {sharing ? "Sharing location..." : shared ? "Location shared ✓" : "Share my live location"}
      </button>
    </div>
  );
}
