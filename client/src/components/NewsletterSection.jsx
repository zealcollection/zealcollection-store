import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { newsletterAPI } from "../lib/api";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setSubmitting(true);
      await newsletterAPI.subscribe(email.trim());
      toast.success("Welcome to the Zealc.ollection Circle");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-onyx text-ivory py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-4"
        >
          Private Access
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl mb-4"
        >
          The Zealc.ollection Circle
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-ivory/60 max-w-xl mx-auto mb-10 font-body"
        >
          Be the first to discover new collections, private invitations and
          exclusive privileges reserved for our most valued patrons.
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            className="flex-1 bg-transparent border border-ivory/30 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold transition-colors"
          />
          <button type="submit" disabled={submitting} className="btn-gold whitespace-nowrap disabled:opacity-60">
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
