import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { categoriesAPI, newsletterAPI } from "../lib/api";

// ------------------------------------------------------------------
// Footer logo asset + footer background image.
// The gold ZC monogram is bundled in client/public/assets/zealc-logo.webp
// (always visible). When you have a Cloudinary URL, paste it into
// FOOTER_LOGO_URL below and it will take precedence.
// FOOTER_BACKGROUND is an optional full-width background image for the
// sand footer section - paste your Cloudinary URL below. A dark overlay
// keeps the gold logo and text legible over any photo.
// ------------------------------------------------------------------
const FOOTER_LOGO_URL = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786549369/Logo_guev1b.png"; // CLOUDINARY: brand/logo.png (paste URL here to override)
const LOCAL_LOGO_SRC = "/assets/zealc-logo.webp";
const FOOTER_BACKGROUND = ""; // CLOUDINARY: brand/footer/footer-background.jpg
const BRAND_NAME = "Zealc.ollection";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await categoriesAPI.getAll();
        if (!cancelled) setFooterCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
      } catch {
        // Leave footer links as-is if the API is unavailable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Links to specific categories when they exist in the database;
  // otherwise the static labels remain as a safety net.
  const exploreLinks =
    footerCategories.length > 0
      ? footerCategories.map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` }))
      : [
          { label: "Watches", href: "/shop?category=watches" },
          { label: "Handbags", href: "/shop?category=handbags" },
          { label: "Nightwear", href: "/shop?category=nightwear" },
        ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setSubmitting(true);
      await newsletterAPI.subscribe(email.trim());
      toast.success("Thank you for subscribing to the Zealc.ollection newsletter");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasFooterBg = Boolean(FOOTER_BACKGROUND);
  // Colors adapt automatically: dark photo background -> ivory text;
  // no background -> sand background with onyx text.
  const muted = hasFooterBg ? "text-ivory/60" : "text-onyx/60";
  const body = hasFooterBg ? "text-ivory/80" : "text-onyx/80";
  const border = hasFooterBg ? "border-ivory/30" : "border-onyx/30";
  const faint = hasFooterBg ? "text-ivory/40" : "text-onyx/40";
  const heroText = hasFooterBg ? "text-ivory/80" : "text-onyx/80";

  return (
    <footer className={`relative ${hasFooterBg ? "text-ivory" : "bg-sand text-onyx"}`}>
      {hasFooterBg ? (
        <>
          <img
            src={FOOTER_BACKGROUND}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay: darkens the photo so the gold logo and text stay readable */}
          <div className="absolute inset-0 bg-onyx/75" />
        </>
      ) : null}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            {FOOTER_BACKGROUND ? (
              <div className="bg-ivory/95 inline-block p-5 rounded-sm mb-6 shadow-lg">
                <img
                  src={FOOTER_LOGO_URL || LOCAL_LOGO_SRC}
                  alt={`${BRAND_NAME} logo`}
                  className="h-40 object-contain"
                />
              </div>
            ) : (
              <img
                src={FOOTER_LOGO_URL || LOCAL_LOGO_SRC}
                alt={`${BRAND_NAME} logo`}
                className="h-28 object-contain mb-6"
              />
            )}
            <p className={`font-display text-2xl md:text-3xl leading-snug ${heroText}`}>
              Objects for the beautifully ordinary.
            </p>
          </div>

          {/* Explore + Follow */}
          <div>
            <h3 className={`text-[11px] tracking-[0.35em] uppercase ${muted} mb-6`}>
              Explore
            </h3>
            <ul className="space-y-3 mb-10">
              <li>
                <Link to="/shop" className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                  Shop all
                </Link>
              </li>
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className={`text-[11px] tracking-[0.35em] uppercase ${muted} mb-6`}>
              Follow
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${body} hover:text-gold-dark transition-colors inline-flex items-center gap-1`}
                >
                  Instagram <span aria-hidden className="text-xs">&#8599;</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@zealcollection.com"
                  className={`text-sm ${body} hover:text-gold-dark transition-colors inline-flex items-center gap-1`}
                >
                  Email <span aria-hidden className="text-xs">&#8599;</span>
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className={`text-[11px] tracking-[0.35em] uppercase ${muted} mb-6`}>
              About
            </h3>
            <ul className="space-y-3 mb-10">
              <li>
                <Link to="/about" className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                  Our story
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/account" className={`text-sm ${body} hover:text-gold-dark transition-colors`}>
                  Account
                </Link>
              </li>
            </ul>

            {/* Newsletter (compact) */}
            <form onSubmit={handleSubmit} className={`flex gap-0 border-b ${border}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address for newsletter"
                className={`flex-1 bg-transparent px-0 py-2 text-sm ${body} placeholder:${faint} focus:outline-none`}
              />
              <button
                type="submit"
                disabled={submitting}
                className={`text-[11px] tracking-[0.2em] uppercase ${faint} hover:text-gold-dark disabled:opacity-60 px-1`}
              >
                {submitting ? "..." : "Join"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-16 pt-8 border-t ${hasFooterBg ? "border-ivory/20" : "border-onyx/10"} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <p className={`${faint} text-[11px] tracking-wider`}>
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className={`${faint} text-[11px] tracking-wider`}>Visa</span>
            <span className={`${faint} text-[11px] tracking-wider`}>Mastercard</span>
            <span className={`${faint} text-[11px] tracking-wider`}>Paystack</span>
            <span className={`${faint} text-[11px] tracking-wider`}>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
