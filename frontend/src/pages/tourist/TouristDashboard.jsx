import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid,
  Map as MapIcon,
  Compass,
  BookMarked,
  Heart,
  Settings,
  MessageCircle,
  MessageSquareText,
  Trees,
  Star,
  ArrowRight,
} from "lucide-react";

import DashboardShell from "../../layouts/DashboardShell.jsx";
import WeatherWidget from "../../components/dashboard/WeatherWidget.jsx";
import NearbyMap from "../../components/dashboard/NearbyMap.jsx";
import GuideFilters from "../../components/dashboard/GuideFilters.jsx";
import GuideCard from "../../components/dashboard/GuideCard.jsx";
import UpcomingBookings from "../../components/dashboard/UpcomingBookings.jsx";
import NotificationsPanel from "../../components/dashboard/NotificationsPanel.jsx";
import BookingModal from "../../components/booking/BookingModal.jsx";

import { useGeolocation } from "../../hooks/useGeolocation.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSocket } from "../../services/socket.js";
import { distanceKm } from "../../utils/geo.js";
import api from "../../services/api.js";

const NAV_ITEMS = [
  {
    path: "/tourist/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    path: "/guides",
    label: "Find guides",
    icon: Compass,
  },
  {
    path: "/attractions",
    label: "Explore attractions",
    icon: Trees,
  },
  {
    path: "/tourist/bookings",
    label: "My bookings",
    icon: BookMarked,
  },
  {
    path: "/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    path: "/tourist/favorites",
    label: "Favorites",
    icon: Heart,
  },
  {
    path: "/tourist/reviews",
    label: "My reviews",
    icon: MessageSquareText,
  },
  {
    path: "/tourist/settings",
    label: "Settings",
    icon: Settings,
  },
];

const ICON_BY_CATEGORY = {
  Forest: Trees,
  "Nature Trail": Trees,
  Waterfall: Trees,
};

export default function TouristDashboard() {
  const { user } = useAuth();
  const { position } = useGeolocation();

  const [view, setView] = useState("map");

  const [filters, setFilters] = useState({
    language: "",
    maxPrice: "",
    minRating: "",
    availableOnly: false,
  });

  const [guides, setGuides] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingGuides, setLoadingGuides] = useState(true);
  const [loadingAttractions, setLoadingAttractions] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [favoritedGuideIds, setFavoritedGuideIds] = useState(new Set());
  const [favoritedAttractionIds, setFavoritedAttractionIds] = useState(
    new Set()
  );

  const [bookingGuide, setBookingGuide] = useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD GUIDES
   * ---------------------------------------------------------
   */
  const fetchGuides = useCallback(() => {
    setLoadingGuides(true);

    const params = {};

    if (filters.language) {
      params.language = filters.language;
    }

    if (filters.maxPrice) {
      params.max_price = filters.maxPrice;
    }

    if (filters.minRating) {
      params.min_rating = filters.minRating;
    }

    if (filters.availableOnly) {
      params.available = true;
    }

    api
      .get("/guides/", { params })
      .then(({ data }) => {
        setGuides(Array.isArray(data.guides) ? data.guides : []);
      })
      .catch((error) => {
        console.error("Failed to load guides:", error);
        setGuides([]);
      })
      .finally(() => {
        setLoadingGuides(false);
      });
  }, [filters]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  /*
   * ---------------------------------------------------------
   * LOAD ATTRACTIONS
   *
   * This loads attractions created by the administrator.
   * The backend endpoint is:
   *
   * GET /api/attractions/
   * ---------------------------------------------------------
   */
  const fetchAttractions = useCallback(() => {
    setLoadingAttractions(true);

    api
      .get("/attractions/")
      .then(({ data }) => {
        console.log("Attractions received:", data);

        const attractionList = Array.isArray(data.attractions)
          ? data.attractions
          : [];

        setAttractions(attractionList);
      })
      .catch((error) => {
        console.error("Failed to load attractions:", error);
        setAttractions([]);
      })
      .finally(() => {
        setLoadingAttractions(false);
      });
  }, []);

  useEffect(() => {
    fetchAttractions();
  }, [fetchAttractions]);

  /*
   * ---------------------------------------------------------
   * LOAD BOOKINGS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    setLoadingBookings(true);

    api
      .get("/bookings/my")
      .then(({ data }) => {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      })
      .catch((error) => {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      })
      .finally(() => {
        setLoadingBookings(false);
      });
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD NOTIFICATIONS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    setLoadingNotifications(true);

    api
      .get("/notifications/")
      .then(({ data }) => {
        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : []
        );
      })
      .catch((error) => {
        console.error("Failed to load notifications:", error);
        setNotifications([]);
      })
      .finally(() => {
        setLoadingNotifications(false);
      });
  }, []);

  /*
   * ---------------------------------------------------------
   * REAL-TIME NOTIFICATIONS
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const socket = getSocket();

    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("new_notification", handleNew);

    return () => {
      socket.off("new_notification", handleNew);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * GUIDE FAVORITES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (guides.length === 0) {
      setFavoritedGuideIds(new Set());
      return;
    }

    api
      .get("/favorites/status", {
        params: {
          guide_ids: guides.map((g) => g.id).join(","),
        },
      })
      .then(({ data }) => {
        setFavoritedGuideIds(new Set(data.guide_ids || []));
      })
      .catch(() => {});
  }, [guides]);

  /*
   * ---------------------------------------------------------
   * ATTRACTION FAVORITES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (attractions.length === 0) {
      setFavoritedAttractionIds(new Set());
      return;
    }

    api
      .get("/favorites/status", {
        params: {
          attraction_ids: attractions.map((a) => a.id).join(","),
        },
      })
      .then(({ data }) => {
        setFavoritedAttractionIds(
          new Set(data.attraction_ids || [])
        );
      })
      .catch(() => {});
  }, [attractions]);

  /*
   * ---------------------------------------------------------
   * NOTIFICATIONS
   * ---------------------------------------------------------
   */
  const handleMarkRead = (id) => {
    api.put(`/notifications/${id}/read`).then(() => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    });
  };

  const handleMarkAllRead = () => {
    api.put("/notifications/read-all").then(() => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    });
  };

  /*
   * ---------------------------------------------------------
   * BOOKINGS
   * ---------------------------------------------------------
   */
  const refreshBookings = () => {
    setLoadingBookings(true);

    api
      .get("/bookings/my")
      .then(({ data }) => {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      })
      .catch(() => {
        setBookings([]);
      })
      .finally(() => {
        setLoadingBookings(false);
      });
  };

  /*
   * ---------------------------------------------------------
   * SORT GUIDES BY DISTANCE
   * ---------------------------------------------------------
   */
  const sortedGuides = useMemo(() => {
    if (!position) {
      return guides;
    }

    return [...guides].sort((a, b) => {
      const distanceA =
        distanceKm(
          position.lat,
          position.lng,
          a.current_lat,
          a.current_lng
        ) ?? Infinity;

      const distanceB =
        distanceKm(
          position.lat,
          position.lng,
          b.current_lat,
          b.current_lng
        ) ?? Infinity;

      return distanceA - distanceB;
    });
  }, [guides, position]);

  /*
   * ---------------------------------------------------------
   * SORT ATTRACTIONS BY DISTANCE
   * ---------------------------------------------------------
   */
  const sortedAttractions = useMemo(() => {
    if (!position) {
      return attractions;
    }

    return [...attractions].sort((a, b) => {
      const distanceA =
        distanceKm(
          position.lat,
          position.lng,
          a.lat,
          a.lng
        ) ?? Infinity;

      const distanceB =
        distanceKm(
          position.lat,
          position.lng,
          b.lat,
          b.lng
        ) ?? Infinity;

      return distanceA - distanceB;
    });
  }, [attractions, position]);

  /*
   * ---------------------------------------------------------
   * USER INFORMATION
   * ---------------------------------------------------------
   */
  const firstName =
    user?.full_name?.split(" ")[0] || "there";

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      title="Dashboard"
    >
      {/* =====================================================
          WELCOME
      ====================================================== */}
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">
          Karibu, {firstName} 👋
        </h2>

        <p className="text-sm text-charcoal/55 dark:text-white/45 mt-1">
          {today}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ===================================================
            MAIN COLUMN
        ==================================================== */}
        <div className="lg:col-span-2 space-y-6">

          <GuideFilters
            filters={filters}
            onChange={setFilters}
          />

          {/* =================================================
              MAP / LIST SECTION
          ================================================== */}
          <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-4">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h3 className="font-semibold text-charcoal dark:text-white text-sm">
                  Guides & attractions near you
                </h3>

                <p className="text-xs text-charcoal/45 dark:text-white/40 mt-1">
                  {attractions.length} attraction
                  {attractions.length !== 1 ? "s" : ""} available
                </p>
              </div>

              <div className="flex items-center gap-1 bg-soft dark:bg-white/5 rounded-full p-1">

                <button
                  onClick={() => setView("map")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    view === "map"
                      ? "bg-forest text-white"
                      : "text-charcoal/60 dark:text-white/50"
                  }`}
                >
                  <MapIcon size={13} />
                  Map
                </button>

                <button
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    view === "list"
                      ? "bg-forest text-white"
                      : "text-charcoal/60 dark:text-white/50"
                  }`}
                >
                  <LayoutGrid size={13} />
                  List
                </button>

              </div>
            </div>

            {/* =================================================
                MAP VIEW
            ================================================== */}
            {view === "map" && (
              <div className="h-96">
                <NearbyMap
                  userPosition={position}
                  guides={sortedGuides}
                  attractions={sortedAttractions}
                />
              </div>
            )}

            {/* =================================================
                LIST VIEW
            ================================================== */}
            {view === "list" && (
              <div className="space-y-8">

                {/* ===============================
                    ATTRACTIONS
                ================================ */}
                <section>

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <h4 className="font-semibold text-charcoal dark:text-white">
                        Explore attractions
                      </h4>

                      <p className="text-xs text-charcoal/45 dark:text-white/40 mt-1">
                        Places added by EcoGuide administrators
                      </p>
                    </div>

                    <a
                      href="/attractions"
                      className="flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-light"
                    >
                      View all
                      <ArrowRight size={13} />
                    </a>

                  </div>

                  {loadingAttractions && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-charcoal/45 dark:text-white/40">
                        Loading attractions...
                      </p>
                    </div>
                  )}

                  {!loadingAttractions &&
                    sortedAttractions.length === 0 && (
                      <div className="py-8 text-center rounded-xl bg-soft dark:bg-white/5">
                        <Trees
                          size={32}
                          className="mx-auto text-charcoal/25 dark:text-white/25 mb-2"
                        />

                        <p className="text-sm text-charcoal/45 dark:text-white/40">
                          No attractions have been added yet.
                        </p>
                      </div>
                    )}

                  {!loadingAttractions &&
                    sortedAttractions.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4">

                        {sortedAttractions.map((attraction) => {

                          const Icon =
                            ICON_BY_CATEGORY[
                              attraction.category
                            ] || Trees;

                          const distance =
                            position &&
                            distanceKm(
                              position.lat,
                              position.lng,
                              attraction.lat,
                              attraction.lng
                            );

                          return (
                            <div
                              key={attraction.id}
                              className="bg-soft dark:bg-white/5 rounded-xl overflow-hidden hover:shadow-card transition-shadow"
                            >

                              {/* IMAGE / ICON */}
                              <div className="h-32 relative overflow-hidden">

                                {attraction.cover_image_url ? (
                                  <img
                                    src={attraction.cover_image_url}
                                    alt={attraction.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
                                    <Icon
                                      size={42}
                                      className="text-white/90"
                                    />
                                  </div>
                                )}

                                {/* CATEGORY */}
                                <span className="absolute top-3 left-3 text-[11px] font-semibold bg-white/90 text-charcoal px-2.5 py-1 rounded-full">
                                  {attraction.category}
                                </span>

                              </div>

                              {/* CONTENT */}
                              <div className="p-4">

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">

                                    <h5 className="font-semibold text-sm text-charcoal dark:text-white truncate">
                                      {attraction.name}
                                    </h5>

                                    {attraction.description && (
                                      <p className="text-xs text-charcoal/50 dark:text-white/40 mt-1 line-clamp-2">
                                        {attraction.description}
                                      </p>
                                    )}

                                  </div>

                                  <Heart
                                    size={16}
                                    className={
                                      favoritedAttractionIds.has(
                                        attraction.id
                                      )
                                        ? "fill-red-500 text-red-500 shrink-0"
                                        : "text-charcoal/30 dark:text-white/30 shrink-0"
                                    }
                                  />

                                </div>

                                {/* DETAILS */}
                                <div className="flex items-center justify-between mt-4">

                                  <div className="flex items-center gap-3">

                                    {attraction.average_rating > 0 ? (
                                      <span className="flex items-center gap-1 text-xs text-charcoal/55 dark:text-white/50">
                                        <Star
                                          size={12}
                                          className="fill-gold text-gold"
                                        />
                                        {Number(
                                          attraction.average_rating
                                        ).toFixed(1)}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-charcoal/40 dark:text-white/35">
                                        No reviews
                                      </span>
                                    )}

                                    <span className="text-xs text-charcoal/50 dark:text-white/45">
                                      KSh{" "}
                                      {Number(
                                        attraction.entrance_fee || 0
                                      ).toLocaleString()}
                                    </span>

                                  </div>

                                  {distance != null && (
                                    <span className="text-[11px] text-charcoal/40 dark:text-white/35">
                                      {distance.toFixed(1)} km
                                    </span>
                                  )}

                                </div>

                                {/* VIEW BUTTON */}
                                <a
                                  href={`/attractions/${attraction.id}`}
                                  className="block text-center mt-4 bg-forest text-white text-xs font-semibold rounded-lg py-2.5 hover:bg-forest-light transition-colors"
                                >
                                  Explore attraction
                                </a>

                              </div>
                            </div>
                          );
                        })}

                      </div>
                    )}

                </section>

                {/* ===============================
                    GUIDES
                ================================ */}
                <section>

                  <div className="mb-4">

                    <h4 className="font-semibold text-charcoal dark:text-white">
                      Find a guide
                    </h4>

                    <p className="text-xs text-charcoal/45 dark:text-white/40 mt-1">
                      Connect with local eco-guides
                    </p>

                  </div>

                  {loadingGuides && (
                    <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
                      Loading guides...
                    </p>
                  )}

                  {!loadingGuides &&
                    sortedGuides.length === 0 && (
                      <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">
                        No guides match those filters yet.
                      </p>
                    )}

                  <div className="grid sm:grid-cols-2 gap-4">

                    {sortedGuides.map((guide) => (
                      <GuideCard
                        key={guide.id}
                        guide={guide}
                        distanceKm={
                          position
                            ? distanceKm(
                                position.lat,
                                position.lng,
                                guide.current_lat,
                                guide.current_lng
                              )
                            : null
                        }
                        onBook={setBookingGuide}
                        isFavorited={favoritedGuideIds.has(
                          guide.id
                        )}
                      />
                    ))}

                  </div>

                </section>

              </div>
            )}

          </div>
        </div>

        {/* ===================================================
            SIDEBAR
        ==================================================== */}
        <div className="space-y-6">

          <WeatherWidget
            lat={position?.lat}
            lng={position?.lng}
          />

          <UpcomingBookings
            bookings={bookings}
            loading={loadingBookings}
          />

          <NotificationsPanel
            notifications={notifications}
            loading={loadingNotifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />

        </div>

      </div>

      {/* =====================================================
          BOOKING MODAL
      ====================================================== */}
      {bookingGuide && (
        <BookingModal
          guide={bookingGuide}
          onClose={() => setBookingGuide(null)}
          onBooked={refreshBookings}
        />
      )}

    </DashboardShell>
  );
}
