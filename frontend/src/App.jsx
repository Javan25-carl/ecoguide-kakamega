import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

import GuidesList from "./pages/GuidesList.jsx";
import GuideDetail from "./pages/GuideDetail.jsx";
import AttractionsList from "./pages/AttractionsList.jsx";
import AttractionDetail from "./pages/AttractionDetail.jsx";
import Messages from "./pages/Messages.jsx";

import TouristDashboard from "./pages/tourist/TouristDashboard.jsx";
import MyBookings from "./pages/tourist/MyBookings.jsx";
import Favorites from "./pages/tourist/Favorites.jsx";
import MyReviews from "./pages/tourist/MyReviews.jsx";
import TouristSettings from "./pages/tourist/Settings.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import GuideDashboard from "./pages/guide/GuideDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Public browsing - guides & attractions */}
        <Route path="/guides" element={<GuidesList />} />
        <Route path="/guides/:id" element={<GuideDetail />} />
        <Route path="/attractions" element={<AttractionsList />} />
        <Route path="/attractions/:id" element={<AttractionDetail />} />

        {/* Tourist */}
        <Route
          path="/tourist/dashboard"
          element={
            <ProtectedRoute allowedRoles={["tourist"]}>
              <TouristDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourist/bookings"
          element={
            <ProtectedRoute allowedRoles={["tourist"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourist/favorites"
          element={
            <ProtectedRoute allowedRoles={["tourist"]}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourist/reviews"
          element={
            <ProtectedRoute allowedRoles={["tourist"]}>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tourist/settings"
          element={
            <ProtectedRoute allowedRoles={["tourist"]}>
              <TouristSettings />
            </ProtectedRoute>
          }
        />

        {/* Guide */}
        <Route
          path="/guide/dashboard"
          element={
            <ProtectedRoute allowedRoles={["guide"]}>
              <GuideDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Messages - shared by any authenticated role */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:partnerId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
