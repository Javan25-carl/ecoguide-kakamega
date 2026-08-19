import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Star } from "lucide-react";

const KAKAMEGA_FALLBACK = { lat: 0.2827, lng: 34.7519 };

/**
 * Leaflet's default marker icon references image files by relative path,
 * which breaks under Vite/webpack bundling unless you import and rewire
 * them manually - a well-known gotcha. Sidestepping it entirely by using
 * small colored divIcons instead of the default pin, which also lets the
 * markers match the app's brand colors (sky/forest/gold) like the
 * original Google Maps version did.
 */
function dotIcon(color, size = 16) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const USER_ICON = dotIcon("#4FC3F7", 18);
const GUIDE_ICON = dotIcon("#2E7D32", 15);
const ATTRACTION_ICON = dotIcon("#FFC107", 15);

/** MapContainer's `center` prop only sets the *initial* view - it isn't
 * reactive. This re-centers the map whenever the position we're tracking
 * actually changes (e.g. geolocation resolves after the map first mounts). */
function RecenterOnChange({ center }) {
  const map = useMap();
  useMemo(() => {
    map.setView(center, map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);
  return null;
}

export default function NearbyMap({ userPosition, guides, attractions }) {
  const center = useMemo(() => userPosition || KAKAMEGA_FALLBACK, [userPosition]);

  const guidesWithLocation = guides.filter((g) => g.current_lat && g.current_lng);

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterOnChange center={center} />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={USER_ICON}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {guidesWithLocation.map((g) => (
        <Marker key={g.id} position={[g.current_lat, g.current_lng]} icon={GUIDE_ICON}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-charcoal">{g.user?.full_name || "Guide"}</p>
              <p className="text-charcoal/60 text-xs mb-1.5">{g.specialization || "General eco-tours"}</p>
              <div className="flex items-center gap-2 text-xs text-charcoal/70 mb-2">
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="fill-gold text-gold" />
                  {g.average_rating?.toFixed?.(1) ?? "New"}
                </span>
                <span>KSh {g.hourly_rate?.toLocaleString?.()}/hr</span>
              </div>
              <Link to={`/guides/${g.id}`} className="text-forest font-semibold text-xs hover:underline">
                View profile →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {attractions.map((a) => (
        <Marker key={a.id} position={[a.lat, a.lng]} icon={ATTRACTION_ICON}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-charcoal">{a.name}</p>
              <p className="text-charcoal/60 text-xs mb-2">{a.category} · KSh {a.entrance_fee}</p>
              <Link to={`/attractions/${a.id}`} className="text-forest font-semibold text-xs hover:underline">
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
