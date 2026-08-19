import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import TextField from "../components/auth/TextField.jsx";
import api from "../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch {
      // Backend always returns 200 for this endpoint by design, so a
      // network-level failure is the only realistic error case here.
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-14 h-14 rounded-full bg-forest/10 grid place-items-center mb-5">
            <CheckCircle2 size={26} className="text-forest" />
          </div>
          <p className="text-charcoal/70 text-sm max-w-xs">
            If an account exists for <strong>{email}</strong>, we've sent a
            link to reset your password. It expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="mt-8 text-sm font-semibold text-forest hover:underline"
          >
            Back to log in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={email}
          error={error}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest text-white font-semibold rounded-xl py-3.5 hover:bg-forest-light transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          Remembered it after all?{" "}
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
