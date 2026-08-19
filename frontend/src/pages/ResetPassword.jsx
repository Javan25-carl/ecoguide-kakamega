import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import TextField from "../components/auth/TextField.jsx";
import api from "../services/api.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!token) {
      setServerError("This reset link is missing its token. Request a new one.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err?.response?.data?.error || "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-14 h-14 rounded-full bg-forest/10 grid place-items-center mb-5">
            <CheckCircle2 size={26} className="text-forest" />
          </div>
          <p className="text-charcoal/70 text-sm">
            Redirecting you to log in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Make it at least 8 characters.">
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="New password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-charcoal/40 hover:text-charcoal/70"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        <TextField
          label="Confirm new password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        {serverError && (
          <p className="mb-5 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-forest text-white font-semibold rounded-xl py-3.5 hover:bg-forest-light transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Updating..." : "Update password"}
        </button>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
