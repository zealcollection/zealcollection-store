import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

import SEO from "../components/SEO";
import AnimatedSection from "../components/AnimatedSection";
import { contactAPI } from "../lib/api";

// ------------------------------------------------------------------
// CLOUDINARY: Upload to banners/contact-store.jpg and paste URL below.
// ------------------------------------------------------------------
const CONTACT_IMAGE = ""; // CLOUDINARY: banners/contact-store.jpg

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Please enter a message of at least 10 characters"),
});

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      await contactAPI.send(values);
      setSent(true);
      toast.success("Your message has been received");
      reset();
    } catch (error) {
      toast.error(error.message || "Could not send your message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Contact" description="Get in touch with the Zealc.ollection team." />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-16">
        <div className="text-center mb-14">
          <h1 className="section-heading text-3xl md:text-5xl mb-5">Contact Us</h1>
          <p className="text-onyx/60 max-w-xl mx-auto font-body">
            Our team is available to assist with product enquiries,
            order support and appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact form */}
          <AnimatedSection>
            {sent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gold/40 bg-mist/40 p-12 text-center"
              >
                <p className="font-display text-2xl mb-3">Message Received</p>
                <p className="text-onyx/60 text-sm mb-8">
                  Thank you for contacting Zealc.ollection. A member of our
                  team will respond within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-luxury-outline"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                      Full Name
                    </label>
                    <input
                      {...register("name")}
                      className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold ${
                        errors.name ? "border-red-400" : "border-mist"
                      }`}
                      placeholder="Alexandra Montague"
                    />
                    {errors.name && <p className="text-xs text-red-700 mt-1.5">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold ${
                        errors.email ? "border-red-400" : "border-mist"
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-700 mt-1.5">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                    Subject
                  </label>
                  <input
                    {...register("subject")}
                    className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold ${
                      errors.subject ? "border-red-400" : "border-mist"
                    }`}
                    placeholder="Product enquiry, order support..."
                  />
                  {errors.subject && <p className="text-xs text-red-700 mt-1.5">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    className={`w-full border px-4 py-3.5 text-sm focus:outline-none focus:border-gold resize-none ${
                      errors.message ? "border-red-400" : "border-mist"
                    }`}
                    placeholder="How may we assist you?"
                  />
                  {errors.message && <p className="text-xs text-red-700 mt-1.5">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </AnimatedSection>

          {/* Contact details */}
          <AnimatedSection delay={0.15}>
            <div className="space-y-8">
              <div className="relative aspect-[4/3] bg-mist overflow-hidden">
                {CONTACT_IMAGE ? (
                  <img
                    src={CONTACT_IMAGE}
                    alt="Zealc.ollection"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onyx/15 text-xs tracking-[0.3em] uppercase">
                    Boutique Image
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <Mail size={18} className="text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-onyx/50 mb-1">Email</p>
                    <p className="text-sm">zealc.ollection28@gmail.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone size={18} className="text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-onyx/50 mb-1">Phone</p>
                    <p className="text-sm">+254 18 690768</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin size={18} className="text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-onyx/50 mb-1">Zealcollection</p>
                    <p className="text-sm">Nairobi, Kenya</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock size={18} className="text-gold mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-onyx/50 mb-1">Hours</p>
                    <p className="text-sm">Mon - Sat, 10:00 - 19:00</p>
                  </div>
                </div>
              </div>

              <blockquote className="border-l-2 border-gold pl-6 py-2">
                <p className="font-garamond text-xl italic text-onyx/80">
                  "True luxury is experienced in the details of how you are
                  cared for, long after the purchase is complete."
                </p>
              </blockquote>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}