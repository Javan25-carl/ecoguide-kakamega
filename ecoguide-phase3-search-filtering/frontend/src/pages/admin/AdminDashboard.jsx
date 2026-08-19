import { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid, Users, Compass, ClipboardCheck, TrendingUp, Wallet, CheckCircle2, Clock, MessageCircle, Trees, Flag,
} from "lucide-react";
import DashboardShell from "../../layouts/DashboardShell.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import BookingStatusChart from "../../components/dashboard/BookingStatusChart.jsx";
import GuideApprovalsList from "../../components/dashboard/GuideApprovalsList.jsx";
import UserManagementTable from "../../components/dashboard/UserManagementTable.jsx";
import BookingManagementTable from "../../components/dashboard/BookingManagementTable.jsx";
import AttractionManagementTable from "../../components/dashboard/AttractionManagementTable.jsx";
import ReportedReviewsList from "../../components/dashboard/ReportedReviewsList.jsx";
import AttractionFormModal from "../../components/admin/AttractionFormModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
  { path: "/admin/dashboard#user-management", label: "Users", icon: Users },
  { path: "/admin/dashboard#guide-approvals", label: "Guide approvals", icon: Compass },
  { path: "/admin/dashboard#booking-management", label: "Bookings", icon: ClipboardCheck },
  { path: "/admin/dashboard#attraction-management", label: "Attractions", icon: Trees },
  { path: "/admin/dashboard#reported-reviews", label: "Reported reviews", icon: Flag },
  { path: "/messages", label: "Messages", icon: MessageCircle },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({});
  const [pendingGuides, setPendingGuides] = useState([]);
  const [users, setUsers] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingGuides, setLoadingGuides] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAttractions, setLoadingAttractions] = useState(true);
  const [loadingReportedReviews, setLoadingReportedReviews] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingAttractionId, setDeletingAttractionId] = useState(null);
  const [editingAttraction, setEditingAttraction] = useState(null);
  const [showAttractionForm, setShowAttractionForm] = useState(false);
  const [actingReviewId, setActingReviewId] = useState(null);

  const fetchStats = useCallback(() => {
    setLoadingStats(true);
    api.get("/admin/stats").then(({ data }) => setStats(data)).finally(() => setLoadingStats(false));
  }, []);

  const fetchPendingGuides = useCallback(() => {
    setLoadingGuides(true);
    api
      .get("/admin/guides/pending")
      .then(({ data }) => setPendingGuides(data.guides || []))
      .finally(() => setLoadingGuides(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchPendingGuides(); }, [fetchPendingGuides]);

  useEffect(() => {
    setLoadingUsers(true);
    api.get("/admin/users").then(({ data }) => setUsers(data.users || [])).finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    setLoadingAttractions(true);
    api
      .get("/attractions/")
      .then(({ data }) => setAttractions(data.attractions || []))
      .finally(() => setLoadingAttractions(false));
  }, []);

  useEffect(() => {
    setLoadingReportedReviews(true);
    api
      .get("/admin/reviews/reported")
      .then(({ data }) => setReportedReviews(data.reviews || []))
      .finally(() => setLoadingReportedReviews(false));
  }, []);

  const handleApprove = async (guideId) => {
    setApprovingId(guideId);
    try {
      await api.put(`/admin/guides/${guideId}/approve`);
      setPendingGuides((prev) => prev.filter((g) => g.id !== guideId));
      fetchStats();
    } finally {
      setApprovingId(null);
    }
  };

  const handleToggleActive = async (targetUser) => {
    setTogglingId(targetUser.id);
    try {
      const action = targetUser.is_active ? "deactivate" : "activate";
      await api.put(`/admin/users/${targetUser.id}/${action}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: !u.is_active } : u))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddAttraction = () => {
    setEditingAttraction(null);
    setShowAttractionForm(true);
  };

  const handleEditAttraction = (attraction) => {
    setEditingAttraction(attraction);
    setShowAttractionForm(true);
  };

  const handleAttractionSaved = (attraction) => {
    setAttractions((prev) => {
      const exists = prev.some((a) => a.id === attraction.id);
      return exists ? prev.map((a) => (a.id === attraction.id ? attraction : a)) : [attraction, ...prev];
    });
    setShowAttractionForm(false);
    setEditingAttraction(null);
  };

  const handleDeleteAttraction = async (attraction) => {
    setDeletingAttractionId(attraction.id);
    try {
      await api.delete(`/attractions/${attraction.id}`);
      setAttractions((prev) => prev.filter((a) => a.id !== attraction.id));
    } catch (err) {
      window.alert(err?.response?.data?.error || "Couldn't delete this attraction.");
    } finally {
      setDeletingAttractionId(null);
    }
  };

  const handleDismissReport = async (review) => {
    setActingReviewId(review.id);
    try {
      await api.put(`/admin/reviews/${review.id}/dismiss`);
      setReportedReviews((prev) => prev.filter((r) => r.id !== review.id));
    } finally {
      setActingReviewId(null);
    }
  };

  const handleDeleteReportedReview = async (review) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setActingReviewId(review.id);
    try {
      await api.delete(`/reviews/${review.id}`);
      setReportedReviews((prev) => prev.filter((r) => r.id !== review.id));
    } finally {
      setActingReviewId(null);
    }
  };

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <DashboardShell navItems={NAV_ITEMS} title="Admin dashboard">
      <div className="mb-6">
        <h2 className="font-semibold text-2xl text-charcoal dark:text-white">
          Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}
        </h2>
        <p className="text-sm text-charcoal/55 dark:text-white/45 mt-1">
          Platform overview and moderation tools.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total tourists" value={loadingStats ? "…" : stats.total_users ?? 0} accent="forest" />
        <StatCard icon={Compass} label="Total guides" value={loadingStats ? "…" : stats.total_guides ?? 0} accent="emerald" />
        <StatCard icon={Clock} label="Pending approvals" value={loadingStats ? "…" : stats.pending_guide_approvals ?? 0} accent="gold" />
        <StatCard icon={Wallet} label="Total revenue" value={loadingStats ? "…" : `KSh ${(stats.total_revenue ?? 0).toLocaleString()}`} accent="sky" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Active trips" value={loadingStats ? "…" : stats.active_trips ?? 0} accent="sky" />
        <StatCard icon={CheckCircle2} label="Completed trips" value={loadingStats ? "…" : stats.completed_trips ?? 0} accent="forest" />
      </div>

      <div id="booking-management" className="grid lg:grid-cols-3 gap-6 mb-6 scroll-mt-24">
        <div className="lg:col-span-2">
          <BookingManagementTable />
        </div>
        <BookingStatusChart stats={stats} />
      </div>

      <div id="user-management" className="grid lg:grid-cols-3 gap-6 mb-6 scroll-mt-24">
        <div className="lg:col-span-2">
          <UserManagementTable
            users={users}
            loading={loadingUsers}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />
        </div>
        <div id="guide-approvals" className="scroll-mt-24">
          <GuideApprovalsList
            guides={pendingGuides}
            loading={loadingGuides}
            onApprove={handleApprove}
            approvingId={approvingId}
          />
        </div>
      </div>

      <div id="attraction-management" className="mb-6 scroll-mt-24">
        <AttractionManagementTable
          attractions={attractions}
          loading={loadingAttractions}
          onAdd={handleAddAttraction}
          onEdit={handleEditAttraction}
          onDelete={handleDeleteAttraction}
          deletingId={deletingAttractionId}
        />
      </div>

      <div id="reported-reviews" className="mb-6 scroll-mt-24">
        <ReportedReviewsList
          reviews={reportedReviews}
          loading={loadingReportedReviews}
          onDismiss={handleDismissReport}
          onDelete={handleDeleteReportedReview}
          actingId={actingReviewId}
        />
      </div>

      <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">Recent registrations</h3>
        <div className="space-y-3">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-charcoal/10 dark:border-white/10 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="text-sm font-medium text-charcoal dark:text-white">{u.full_name}</p>
                <p className="text-xs text-charcoal/45 dark:text-white/40">{u.email}</p>
              </div>
              <span className="text-xs font-semibold capitalize text-charcoal/50 dark:text-white/40 bg-soft dark:bg-white/5 px-2.5 py-1 rounded-full">
                {u.role}
              </span>
            </div>
          ))}
          {recentUsers.length === 0 && (
            <p className="text-sm text-charcoal/45 dark:text-white/40 py-4 text-center">No registrations yet.</p>
          )}
        </div>
      </div>

      {showAttractionForm && (
        <AttractionFormModal
          attraction={editingAttraction}
          onClose={() => {
            setShowAttractionForm(false);
            setEditingAttraction(null);
          }}
          onSaved={handleAttractionSaved}
        />
      )}
    </DashboardShell>
  );
}
