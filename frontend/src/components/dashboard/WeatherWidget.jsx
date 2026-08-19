import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from "lucide-react";

const WEATHER_CODE_MAP = {
  0: { label: "Clear sky", icon: Sun },
  1: { label: "Mostly clear", icon: CloudSun },
  2: { label: "Partly cloudy", icon: CloudSun },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Foggy", icon: Cloud },
  48: { label: "Foggy", icon: Cloud },
  51: { label: "Light drizzle", icon: CloudRain },
  61: { label: "Light rain", icon: CloudRain },
  63: { label: "Rain", icon: CloudRain },
  65: { label: "Heavy rain", icon: CloudRain },
  80: { label: "Rain showers", icon: CloudRain },
  95: { label: "Thunderstorm", icon: CloudRain },
};

export default function WeatherWidget({ lat, lng }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) return;
    setLoading(true);
    setError(false);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,relative_humidity_2m&timezone=auto`
    )
      .then((res) => res.json())
      .then((data) => setWeather(data.current))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const conditionInfo = weather ? WEATHER_CODE_MAP[weather.weather_code] || WEATHER_CODE_MAP[3] : null;
  const Icon = conditionInfo?.icon || Cloud;

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Weather at your location
      </h3>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6">
          <Loader2 size={16} className="animate-spin" /> Fetching forecast...
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-charcoal/45 dark:text-white/40 py-6">
          Couldn't load live weather right now.
        </p>
      )}

      {!loading && !error && weather && (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sky/15 grid place-items-center shrink-0">
            <Icon size={26} className="text-sky" />
          </div>
          <div>
            <div className="font-semibold text-3xl text-charcoal dark:text-white">
              {Math.round(weather.temperature_2m)}°C
            </div>
            <p className="text-sm text-charcoal/55 dark:text-white/50">
              {conditionInfo.label} · {weather.relative_humidity_2m}% humidity
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
