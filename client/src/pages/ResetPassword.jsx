import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { KeyRound, Eye, EyeOff } from "lucide-react";

import SEO from "../components/SEO";
import { authAPI } from "../lib/api";

const resetSchema = z
  .object({
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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await authAPI.resetPassword(token, {
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setDone(true);
      toast.success("Your password has been updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Reset Password" description="Choose a new password for your Zealc.ollection account." />

      <div className="max-w-md mx-auto px-4 pt-[120px] md:pt-[210px] pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow text-center mb-3">Account Recovery</p>
          <h1 className="section-heading text-3xl md:text-4xl text-center mb-10">
            Choose New Password
          </h1>

          {done ? (
            <div className="text-center py-8">
              <KeyRound size={48} className="mx-auto text-gold mb-6" />
              <p className="font-display text-xl mb-3">Password Updated</p>
              <p className="text-onyx/60 text-sm mb-8 leading-relaxed">
                Your password has been changed successfully. You can now sign
                in with your new password.
              </p>
              <Link to="/login" className="btn-gold">
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-onyx/60 text-sm leading-relaxed">
                Enter your new password below. This secure link is valid for
                30 minutes.
              </p>

              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                  New Password
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
                    placeholder="Re-enter your new password"
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
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-onyx/60 mt-8">
            Remember your password?{" "}
            <Link to="/login" className="text-gold-dark underline underline-offset-4 hover:text-gold">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
