import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import TextField from "../components/auth/TextField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ROLE_REDIRECT = {
  tourist: "/tourist/dashboard",
  guide: "/guide/dashboard",
  admin: "/admin/dashboard",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(ROLE_REDIRECT[user.role] || "/");
    } catch (err) {
      setServerError(
        err?.response?.data?.error || "Couldn't log you in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your bookings, guides, or trips."
    >
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <TextField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
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

        <div className="flex items-center justify-between mb-6 -mt-1">
          <label className="flex items-center gap-2 text-sm text-charcoal/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
              className="w-4 h-4 rounded accent-forest"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-forest hover:underline">
            Forgot password?
          </Link>
        </div>

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
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-forest hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
