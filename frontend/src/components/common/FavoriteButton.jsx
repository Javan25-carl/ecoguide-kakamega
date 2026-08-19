import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FavoriteButton({ type, id, initialFavorited = false, size = 18, className = "" }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  // Only tourists can save favorites - guides/admins/guests just don't see the button do anything useful
  if (!user || user.role !== "tourist") return null;

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    const endpoint = `/favorites/${type === "guide" ? "guides" : "attractions"}/${id}`;
    const next = !favorited;
    setFavorited(next); // optimistic

    try {
      if (next) {
        await api.post(endpoint);
      } else {
        await api.delete(endpoint);
      }
    } catch {
      setFavorited(!next); // revert on failure
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`grid place-items-center rounded-full transition-colors disabled:opacity-60 ${className}`}
    >
      <Heart
        size={size}
        className={favorited ? "fill-red-500 text-red-500" : "text-charcoal/40 dark:text-white/40"}
      />
    </button>
  );
}
