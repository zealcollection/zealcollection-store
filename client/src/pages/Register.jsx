import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import SEO from "../components/SEO";
import { useApp } from "../context/AppContext";

// Mirrors the server-side strength rules in routes/auth.js.
const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Your account has been created");
      navigate("/account");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    navigate("/account", { replace: true });
    return null;
  }

  return (
    <>
      <SEO title="Register" description="Create your Zealc.ollection account." />

      <div className="max-w-md mx-auto px-4 pt-[120px] md:pt-[210px] pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow text-center mb-3">Join the Circle</p>
          <h1 className="section-heading text-3xl md:text-4xl text-center mb-10">
            Create Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                Full Name
              </label>
              <input
                type="text"
                autoComplete="name"
                {...register("name")}
                className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold ${
                  errors.name ? "border-red-400" : "border-mist"
                }`}
                placeholder="Alexandra Montague"
              />
              {errors.name && (
                <p className="text-xs text-red-700 mt-1.5">{errors.name.message}</p>
              )}
            </div>

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
              <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className={`w-full border px-4 py-3.5 pr-11 text-sm focus:outline-none focus:border-gold ${
                    errors.password ? "border-red-400" : "border-mist"
                  }`}
                  placeholder="Minimum 8 characters"
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

            <div>
              <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={`w-full border px-4 py-3.5 pr-11 text-sm focus:outline-none focus:border-gold ${
                    errors.confirmPassword ? "border-red-400" : "border-mist"
                  }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx/40 hover:text-onyx transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-700 mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full disabled:opacity-60"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-onyx/60 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-dark underline underline-offset-4 hover:text-gold">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
