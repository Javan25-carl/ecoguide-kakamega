import { useState, useEffect } from "react";

const KAKAMEGA_FALLBACK = { lat: 0.2827, lng: 34.7519 };

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState("locating"); // locating | granted | denied | unsupported

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setPosition(KAKAMEGA_FALLBACK);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => {
        setStatus("denied");
        setPosition(KAKAMEGA_FALLBACK);
      },
      { timeout: 8000 }
    );
  }, []);

  return { position, status };
}
