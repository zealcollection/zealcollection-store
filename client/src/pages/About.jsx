import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, Gem, Clock, Leaf, ChevronDown } from "lucide-react";

import SEO from "../components/SEO";
import { imgSrc, imgHero } from "../lib/imageOpt";
import AnimatedSection from "../components/AnimatedSection";
import { settingsAPI } from "../lib/api";
import { FAQ_ITEMS } from "./FAQ";

// ------------------------------------------------------------------
// FAQ data is imported directly from FAQ.jsx so the "Good to Know"
// section always uses the same questions and answers as the FAQ page.
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// CLOUDINARY: Upload to banners/about-craft.jpg and paste URL below.
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// HERO BACKGROUND MEDIA - paste your Cloudinary URL(s) below.
// Use ABOUT_HERO_IMAGE_URL for a still image, or ABOUT_HERO_VIDEO_URL
// for a looping muted video. Recommended size: 2560 x 1440 px landscape.
// ------------------------------------------------------------------
const ABOUT_HERO_IMAGE_URL =
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1787785426/richard_mille_.jpg"; // CLOUDINARY: banners/about-hero.jpg
const ABOUT_HERO_VIDEO_URL = ""; // CLOUDINARY (optional): banners/about-hero.mp4
const ABOUT_CRAFT_IMAGE =
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788888202/about_1.png"; // CLOUDINARY: banners/about-craft.jpg

// ------------------------------------------------------------------
// CLOUDINARY: Upload to banners/about-atelier.jpg and paste URL below.
// ------------------------------------------------------------------
const ABOUT_ATELIER_IMAGE =
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788888200/about_2.png"; // CLOUDINARY: banners/about-atelier.jpg

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
          aboutHeroSubtitle:
            typeof s.aboutHeroSubtitle === "string"
              ? s.aboutHeroSubtitle
              : "",
          aboutStoryTitle:
            typeof s.aboutStoryTitle === "string"
              ? s.aboutStoryTitle
              : "",
          aboutStoryIntro:
            typeof s.aboutStoryIntro === "string"
              ? s.aboutStoryIntro
              : "",
          aboutStoryBody:
            typeof s.aboutStoryBody === "string"
              ? s.aboutStoryBody
              : "",
          aboutStoryClosing:
            typeof s.aboutStoryClosing === "string"
              ? s.aboutStoryClosing
              : "",
          aboutValues: Array.isArray(s.aboutValues)
            ? s.aboutValues
            : [],
          aboutAtelierTitle:
            typeof s.aboutAtelierTitle === "string"
              ? s.aboutAtelierTitle
              : "",
        });
      })
      .catch(() => {});
  }, []);

  const defaultValues = [
    {
      title: "Uncompromising Quality",
      text: "Every timepiece in our collection is carefully selected for its quality, design, and attention to detail, so you can shop with confidence.",
    },
    {
      title: "Rare Materials",
      text: "We carefully select timepieces crafted with quality materials, refined finishes, and attention to detail, bringing you watches that combine style, durability, and timeless appeal.",
    },
    {
      title: "Timeless Design",
      text: "Timeless watches chosen to become lasting pieces in your collection, season after season.",
    },
    {
      title: "Conscious Luxury",
      text: "Thoughtful choices go into every detail, from the watches we curate to the way they are presented and delivered.",
    },
  ];

  const values =
    cms.aboutValues.length > 0
      ? defaultValues.map((v, i) => ({
          ...v,
          ...(cms.aboutValues[i] || {}),
        }))
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
                    <span className="text-onyx/30 text-[10px] tracking-[0.35em] uppercase">
                      Image space
                    </span>
                    <span className="text-onyx/25 text-[9px] tracking-[0.2em] uppercase">
                      Paste Cloudinary URL in ABOUT_CRAFT_IMAGE
                    </span>
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
                <>
                  Chosen with Care,{" "}
                  <em className="text-gold-dark">
                    Worn with Confidence
                  </em>
                </>
              )}
            </h2>

            <p className="text-onyx/70 leading-relaxed mb-5 font-body">
              {cms.aboutStoryIntro ||
                "Zeal Collection began with a simple conviction: that true luxury does not need to announce itself. In a world of noise, we chose restraint. We carefully curate watches and handbags that embody timeless style, elegance, and sophistication. Every piece in our collection is selected with an eye for quality, design, and the details that make an accessory truly stand out."}
            </p>

            <p className="text-onyx/70 leading-relaxed mb-5 font-body">
              {cms.aboutStoryBody ||
                "From refined timepieces to statement handbags, Zeal Collection brings together pieces designed to complement your personal style and elevate every occasion. For us, luxury is about choosing well, wearing confidently, and embracing elegance without excess."}
            </p>

            <p className="text-onyx/70 leading-relaxed font-body">
              {cms.aboutStoryClosing ||
                "We do not follow seasons. We follow permanence."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="bg-mist py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="eyebrow mb-3">What Guides Us</p>
            <h2 className="section-heading text-3xl md:text-4xl">
              Our Values
            </h2>
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
              <AnimatedSection
                key={item.title}
                delay={index * 0.12}
                className="bg-ivory p-8"
              >
                <item.icon size={26} className="text-gold mb-5" />

                <h3 className="font-display text-xl mb-3">
                  {item.title}
                </h3>

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
            <p className="eyebrow mb-4">The Collection</p>

            <h2 className="section-heading text-3xl md:text-4xl mb-6 leading-tight">
              {cms.aboutCollectionTitle ? (
                cms.aboutCollectionTitle
              ) : (
                <>
                  Where Style Meets{" "}
                  <em className="text-gold-dark">Selection</em>
                </>
              )}
            </h2>

            <p className="text-onyx/70 leading-relaxed mb-8 font-body">
              Behind every piece at Zeal Collection is a careful selection
              process. We search for watches and handbags that reflect
              timeless style, quality, and sophistication. From elegant
              timepieces to versatile handbags, each piece is chosen with
              attention to design, finish, and the details that make it worth
              adding to your collection. We believe great style is not about
              having more—it is about choosing pieces that feel right.
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
                    <span className="text-onyx/30 text-[10px] tracking-[0.35em] uppercase">
                      Image space
                    </span>
                    <span className="text-onyx/25 text-[9px] tracking-[0.2em] uppercase">
                      Paste Cloudinary URL in ABOUT_ATELIER_IMAGE
                    </span>
                  </div>
                )}
              </div>

              <figcaption className="flex items-center justify-between px-5 py-3 border-t border-gold/25 bg-ivory">
                <span className="text-[10px] tracking-[0.3em] uppercase text-onyx/50">
                  The Collection
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
            {FAQ_ITEMS.map((item, index) => (
              <FaqAccordionItem
                key={index}
                item={item}
                index={index}
              />
            ))}
          </div>

          <AnimatedSection delay={0.15} className="text-center mt-12">
            <p className="text-ivory/55 mb-6 font-body">
              Still have a question? Our customer service team is happy to
              assist.
            </p>

            <Link to="/contact" className="btn-gold">
              Contact Us
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
              open
                ? "text-gold"
                : "text-ivory group-hover:text-gold"
            }`}
          >
            {item.question}
          </span>

          <ChevronDown
            size={18}
            className={`shrink-0 transition-all duration-300 ${
              open
                ? "text-gold rotate-180"
                : "text-ivory/50"
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
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