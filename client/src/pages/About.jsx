import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, Gem, Clock, Leaf, ChevronDown } from "lucide-react";

import SEO from "../components/SEO";
import { imgSrc, imgHero } from "../lib/imageOpt";
import AnimatedSection from "../components/AnimatedSection";
import { settingsAPI } from "../lib/api";

// ------------------------------------------------------------------
// FAQ data shown inside the About page. The full FAQ page (/faq)
// reuses the same questions, so keep them in sync if you edit.
// ------------------------------------------------------------------
const ABOUT_FAQ_ITEMS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse our collection, select your desired size and color, then click Add to Cart. When you are ready, proceed to Checkout, enter your shipping details and choose your preferred payment method (Paystack, Stripe or Cash on Delivery). You will receive an email confirmation once your order is placed.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards through Paystack and Stripe, including Visa, Mastercard and American Express. Bank transfers, mobile money and Cash on Delivery are also available in selected regions.",
  },
  {
    question: "Do you offer complimentary shipping?",
    answer:
      "Yes. All orders above 500 qualify for complimentary insured shipping worldwide. Orders below this threshold are shipped for a flat rate of 25. Express delivery (1-2 business days) is available for 45.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You may return any unworn item in its original condition and packaging within 30 days of delivery for a full refund. Timepieces must be returned with their certificates of authenticity. Please visit our Shipping and Returns page for full details.",
  },
  {
    question: "Do your watches come with a warranty?",
    answer:
      "Yes. All timepieces carry a two-year international warranty covering manufacturing defects. Leather goods are covered for one year. Please contact our concierge team with your order reference for any warranty claim.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you will receive a tracking number by email. You can also view the status of all your orders in the Orders section of your account dashboard.",
  },
];

// ------------------------------------------------------------------
// CLOUDINARY: Upload to banners/about-craft.jpg and paste URL below.
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// HERO BACKGROUND MEDIA - paste your Cloudinary URL(s) below.
// Use ABOUT_HERO_IMAGE_URL for a still image, or ABOUT_HERO_VIDEO_URL
// for a looping muted video. Recommended size: 2560 x 1440 px landscape.
// ------------------------------------------------------------------
const ABOUT_HERO_IMAGE_URL = ""; // CLOUDINARY: banners/about-hero.jpg
const ABOUT_HERO_VIDEO_URL = ""; // CLOUDINARY (optional): banners/about-hero.mp4
const ABOUT_CRAFT_IMAGE = ""; // CLOUDINARY: banners/about-craft.jpg

// ------------------------------------------------------------------
// CLOUDINARY: Upload to banners/about-atelier.jpg and paste URL below.
// ------------------------------------------------------------------
const ABOUT_ATELIER_IMAGE = ""; // CLOUDINARY: banners/about-atelier.jpg

export default function About() {
  // Admin CMS overrides: every text block below falls back to the copy
  // written in this file until an admin customises it in Site Settings.
  const [cms, setCms] = useState({
    aboutHeroSubtitle: "",
    aboutStoryTitle: "",
    aboutStoryIntro: "",
    aboutStoryBody: "",
    aboutStoryClosing: "",
    aboutValues: [],
    aboutAtelierTitle: "",
  });
  useEffect(() => {
    settingsAPI
      .get()
      .then((res) => {
        const s = res.data?.settings || {};
        setCms({
          aboutHeroSubtitle: typeof s.aboutHeroSubtitle === "string" ? s.aboutHeroSubtitle : "",
          aboutStoryTitle: typeof s.aboutStoryTitle === "string" ? s.aboutStoryTitle : "",
          aboutStoryIntro: typeof s.aboutStoryIntro === "string" ? s.aboutStoryIntro : "",
          aboutStoryBody: typeof s.aboutStoryBody === "string" ? s.aboutStoryBody : "",
          aboutStoryClosing: typeof s.aboutStoryClosing === "string" ? s.aboutStoryClosing : "",
          aboutValues: Array.isArray(s.aboutValues) ? s.aboutValues : [],
          aboutAtelierTitle: typeof s.aboutAtelierTitle === "string" ? s.aboutAtelierTitle : "",
        });
      })
      .catch(() => {});
  }, []);
  const defaultValues = [
    { title: "Uncompromising Quality", text: "Every piece is inspected against 47 quality checkpoints before it leaves our atelier." },
    { title: "Rare Materials", text: "We source only the finest leathers, metals and textiles from certified ethical suppliers." },
    { title: "Timeless Design", text: "Our pieces are designed to be cherished for decades, not discarded after a season." },
    { title: "Conscious Luxury", text: "Sustainability is woven into every decision, from packaging to production methods." },
  ];
  const values = cms.aboutValues.length > 0
    ? defaultValues.map((v, i) => ({ ...v, ...(cms.aboutValues[i] || {}) }))
    : defaultValues;
  return (
    <>
      <SEO
        title="About"
        description="The story of Zealc.ollection - a legacy of quiet luxury, master craftsmanship and timeless design."
      />

      {/* Hero - full-width editorial banner, sized like the Shop and
          Men / Ladies edit heroes */}
      <section className="editorial-hero relative bg-onyx text-ivory overflow-hidden min-h-[88vh] lg:min-h-[92vh] flex items-center">
        {ABOUT_HERO_IMAGE_URL && (
          <img
            src={imgHero(ABOUT_HERO_IMAGE_URL)}
            alt=""
            aria-hidden="true"
            className="editorial-hero__media absolute inset-0 w-full h-full object-cover"
          />
        )}
        {ABOUT_HERO_VIDEO_URL && (
          <video
            src={ABOUT_HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="editorial-hero__media absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Dark scrim so text stays crisp over any media */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
          {/* Clean image-only hero: no headline, label or description.
              The background image is the entire statement. */}

        {/* Gold hairline at the base, like the edit heroes */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      </section>

      {/* Story */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <figure className="relative bg-mist border border-mist overflow-hidden shadow-lg">
              <div className="aspect-[4/5] overflow-hidden">
                {ABOUT_CRAFT_IMAGE ? (
                  <img
                    src={imgSrc(ABOUT_CRAFT_IMAGE, 900)}
                    alt="Master artisan crafting a luxury timepiece"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-mist to-ivory/60 text-center px-6">
                    <span className="text-onyx/30 text-[10px] tracking-[0.35em] uppercase">Image space</span>
                    <span className="text-onyx/25 text-[9px] tracking-[0.2em] uppercase">Paste Cloudinary URL in ABOUT_CRAFT_IMAGE</span>
                  </div>
                )}
              </div>
              <figcaption className="flex items-center justify-between px-5 py-3 border-t border-gold/25 bg-ivory">
                <span className="text-[10px] tracking-[0.3em] uppercase text-onyx/50">
                  The Craft
                </span>
                <span className="h-px w-10 bg-gold/60" />
              </figcaption>
            </figure>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <p className="eyebrow mb-4">Our Heritage</p>
            <h2 className="section-heading text-3xl md:text-4xl mb-6 leading-tight">
              {cms.aboutStoryTitle ? (
                cms.aboutStoryTitle
              ) : (
                <>Crafted in Silence, <em className="text-gold-dark">Worn with Pride</em></>
              )}
            </h2>
            <p className="text-onyx/70 leading-relaxed mb-5 font-body">
              {cms.aboutStoryIntro ||
                "Zealc.ollection began with a simple conviction: that true luxury does not need to announce itself. In a world of noise, we chose restraint. Each timepiece, handbag and garment that bears our name is the product of hundreds of hours of meticulous work by artisans whose skills have been refined over generations."}
            </p>
            <p className="text-onyx/70 leading-relaxed mb-5 font-body">
              {cms.aboutStoryBody ||
                "From the sourcing of ethically mined materials to the final polish of a clasp, we hold every stage of production to a standard that would satisfy only the most exacting eye. The result is a collection that feels inevitable, as though it has always existed."}
            </p>
            <p className="text-onyx/70 leading-relaxed font-body">
              {cms.aboutStoryClosing || "We do not follow seasons. We follow permanence."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="bg-mist py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="eyebrow mb-3">What Guides Us</p>
            <h2 className="section-heading text-3xl md:text-4xl">Our Values</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Uncompromising Quality",
                text: "Every piece is inspected against 47 quality checkpoints before it leaves our atelier.",
              },
              {
                icon: Gem,
                title: "Rare Materials",
                text: "We source only the finest leathers, metals and textiles from certified ethical suppliers.",
              },
              {
                icon: Clock,
                title: "Timeless Design",
                text: "Our pieces are designed to be cherished for decades, not discarded after a season.",
              },
              {
                icon: Leaf,
                title: "Conscious Luxury",
                text: "Sustainability is woven into every decision, from packaging to production methods.",
              },
            ].map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.12} className="bg-ivory p-8">
                <item.icon size={26} className="text-gold mb-5" />
                <h3 className="font-display text-xl mb-3">{item.title}</h3>
                <p className="text-onyx/60 text-sm leading-relaxed font-body">
                  {item.text}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Atelier + CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection delay={0.1}>
            <p className="eyebrow mb-4">The Atelier</p>
            <h2 className="section-heading text-3xl md:text-4xl mb-6 leading-tight">
              {cms.aboutAtelierTitle ? (
                cms.aboutAtelierTitle
              ) : (
                <>Where Hours Become <em className="text-gold-dark">Heirlooms</em></>
              )}
            </h2>
            <p className="text-onyx/70 leading-relaxed mb-8 font-body">
              Behind every Zealc.ollection piece is a workshop where tradition meets
              precision. Our master watchmakers, leather artisans and seamstresses
              work with tools and techniques passed down through generations,
              ensuring that each creation carries the warmth of the human hand.
            </p>
            <Link to="/shop" className="btn-gold">
              Explore the Collection
            </Link>
          </AnimatedSection>
          <AnimatedSection>
            <figure className="relative bg-mist border border-mist overflow-hidden shadow-lg">
              <div className="aspect-[4/5] overflow-hidden">
                {ABOUT_ATELIER_IMAGE ? (
                  <img
                    src={imgSrc(ABOUT_ATELIER_IMAGE, 900)}
                    alt="The Zealc.ollection atelier workshop"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-mist to-ivory/60 text-center px-6">
                    <span className="text-onyx/30 text-[10px] tracking-[0.35em] uppercase">Image space</span>
                    <span className="text-onyx/25 text-[9px] tracking-[0.2em] uppercase">Paste Cloudinary URL in ABOUT_ATELIER_IMAGE</span>
                  </div>
                )}
              </div>
              <figcaption className="flex items-center justify-between px-5 py-3 border-t border-gold/25 bg-ivory">
                <span className="text-[10px] tracking-[0.3em] uppercase text-onyx/50">
                  The Atelier
                </span>
                <span className="h-px w-10 bg-gold/60" />
              </figcaption>
            </figure>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-onyx text-ivory py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="eyebrow mb-3">Good to Know</p>
            <h2 className="section-heading text-3xl md:text-4xl">
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <div className="border-t border-ivory/10">
            {ABOUT_FAQ_ITEMS.map((item, index) => (
              <FaqAccordionItem key={index} item={item} index={index} />
            ))}
          </div>

          <AnimatedSection delay={0.15} className="text-center mt-12">
            <p className="text-ivory/55 mb-6 font-body">
              Still have a question? Our concierge team is happy to assist.
            </p>
            <Link to="/contact" className="btn-gold">
              Contact the Maison
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

function FaqAccordionItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatedSection delay={0.08 * index}>
      <div className="border-b border-ivory/10">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-6 py-6 text-left group"
          aria-expanded={open}
        >
          <span
            className={`font-display text-lg md:text-xl transition-colors duration-300 ${
              open ? "text-gold" : "text-ivory group-hover:text-gold"
            }`}
          >
            {item.question}
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 transition-all duration-300 ${
              open ? "text-gold rotate-180" : "text-ivory/50"
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-6 text-ivory/60 leading-relaxed font-body pr-10">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  );
}
