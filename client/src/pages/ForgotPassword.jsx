import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MailCheck } from "lucide-react";

import SEO from "../components/SEO";
import { authAPI } from "../lib/api";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await authAPI.forgotPassword({ email: values.email });
      setSent(true);
      toast.success("Password reset instructions have been sent to your email");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Forgot Password" description="Reset your Zealc.ollection account password." />

      <div className="max-w-md mx-auto px-4 pt-[120px] md:pt-[210px] pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow text-center mb-3">Account Recovery</p>
          <h1 className="section-heading text-3xl md:text-4xl text-center mb-10">
            Forgot Password
          </h1>

          {sent ? (
            <div className="text-center py-8">
              <MailCheck size={48} className="mx-auto text-gold mb-6" />
              <p className="font-display text-xl mb-3">Check Your Inbox</p>
              <p className="text-onyx/60 text-sm mb-8 leading-relaxed">
                We have sent password reset instructions to your email address.
                Please follow the link in the email to choose a new password.
              </p>
              <Link to="/login" className="btn-gold">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-onyx/60 text-sm leading-relaxed">
                Enter the email address associated with your account and we will
                send you a secure link to reset your password.
              </p>

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

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
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
