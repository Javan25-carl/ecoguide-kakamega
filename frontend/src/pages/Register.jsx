import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Compass, Backpack } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import TextField from "../components/auth/TextField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: "tourist",
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords don't match";
    if (!form.agree) next.agree = "You must accept the terms to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: form.role,
      });
      navigate(user.role === "guide" ? "/guide/dashboard" : "/tourist/dashboard");
    } catch (err) {
      setServerError(
        err?.response?.data?.error || "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join as a tourist to book guides, or as a guide to offer them."
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: "tourist", label: "Tourist", icon: Backpack },
            { value: "guide", label: "Eco-Guide", icon: Compass },
          ].map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => setForm({ ...form, role: value })}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                form.role === value
                  ? "border-forest bg-forest/10 text-forest"
                  : "border-charcoal/15 text-charcoal/60 hover:border-charcoal/30"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <TextField
          label="Full name"
          icon={User}
          placeholder="Jane Wanjiku"
          value={form.full_name}
          error={errors.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

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
          label="Phone (optional)"
          icon={Phone}
          type="tel"
          placeholder="+254 7XX XXX XXX"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <TextField
          label="Password"
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
          label="Confirm password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <label className="flex items-start gap-2.5 mb-6 text-sm text-charcoal/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm({ ...form, agree: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded accent-forest shrink-0"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-forest font-medium hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-forest font-medium hover:underline">Privacy Policy</a>.
          </span>
        </label>
        {errors.agree && <p className="-mt-4 mb-5 text-xs text-red-500">{errors.agree}</p>}

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
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-forest hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
