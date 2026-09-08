import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import SEO from "../components/SEO";
import { useApp } from "../context/AppContext";
import { authAPI } from "../lib/api";

// Configure this once and Google Sign In works everywhere. The value
// comes from console.cloud.google.com (OAuth 2.0 Client ID, Web app).
// It is safe to keep in the source code - it is the public client id,
// not a secret key.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithToken, isAuthenticated, auth } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || "/account";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Load the Google Sign In client library and render the button.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      return;
    }
    let cancelled = false;
    let retryTimer;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const { data } = await authAPI.googleLogin(response.credential);
            loginWithToken(data.token, data.user);
            toast.success("Signed in with Google");
            navigate(data.user?.role === "admin" ? "/admin" : from, { replace: true });
          } catch (err) {
            toast.error(err.message || "Google sign-in failed");
          }
        },
      });
      const el = document.getElementById("google-signin-button");
      if (el) {
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 360,
          text: "signin_with",
          shape: "rectangular",
        });
      }
      return true;
    };
    if (!renderGoogleButton()) {
      retryTimer = window.setInterval(() => {
        if (renderGoogleButton()) window.clearInterval(retryTimer);
      }, 100);
    }
    return () => {
      cancelled = true;
      window.clearInterval(retryTimer);
    };
  }, [loginWithToken, navigate, from]);

  // Redirect after the confirmed user is available. This also handles the
  // case where /auth/me restores the role just after the token is saved.
  useEffect(() => {
    if (isAuthenticated && auth.user) {
      const isAdminUser = String(auth.user.role || "").toLowerCase() === "admin";
      navigate(isAdminUser ? "/admin" : from, { replace: true });
    }
  }, [isAuthenticated, auth.user, navigate, from]);

  const onSubmit = async (values) => {
  try {
    setSubmitting(true);
    const user = await login(values.email, values.password);
    toast.success("Welcome back");
    if (String(user?.role || "").toLowerCase() === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  } catch (err) {
    toast.error(err.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
      <SEO title="Login" description="Sign in to your Zealc.ollection account." />

      <div className="max-w-md mx-auto px-4 pt-[120px] md:pt-[210px] pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow text-center mb-3">Welcome Back</p>
          <h1 className="section-heading text-3xl md:text-4xl text-center mb-10">
            Sign In
          </h1>

          {/* Google Sign In - appears only when a client id is configured */}
          {GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID" && (
            <>
              <div className="flex justify-center mb-6">
                <div id="google-signin-button" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px flex-1 bg-mist" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-onyx/50">or</span>
                <span className="h-px flex-1 bg-mist" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold ${
                  errors.email ? "border-red-400" : "border-mist"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-700 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-gold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className={`w-full border px-4 py-3.5 pr-11 text-sm focus:outline-none focus:border-gold ${
                    errors.password ? "border-red-400" : "border-mist"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx/40 hover:text-onyx transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-700 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full disabled:opacity-60"
            >
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
