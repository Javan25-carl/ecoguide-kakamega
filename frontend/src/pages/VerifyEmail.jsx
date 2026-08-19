import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, setUser } = useAuth();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    api
      .post("/auth/verify-email", { token })
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.message || "Email verified!");
        // If the currently logged-in user is the one who just verified,
        // update their cached state so the "verify your email" banner
        // disappears immediately instead of waiting for their next login.
        if (data.user && user && data.user.id === user.id) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.error || "Couldn't verify this link.");
      });
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthLayout
      title={
        status === "verifying" ? "Verifying your email..." : status === "success" ? "You're verified" : "Couldn't verify"
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        {status === "verifying" && <Loader2 size={32} className="text-forest animate-spin mb-4" />}
        {status === "success" && <CheckCircle2 size={32} className="text-forest mb-4" />}
        {status === "error" && <XCircle size={32} className="text-red-500 mb-4" />}

        <p className="text-sm text-charcoal/60 max-w-xs">{message}</p>

        {status !== "verifying" && (
          <Link
            to={user ? "/" : "/login"}
            className="mt-6 bg-forest text-white text-sm font-semibold rounded-xl px-6 py-2.5 hover:bg-forest-light transition-colors"
          >
            {user ? "Continue" : "Go to login"}
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
