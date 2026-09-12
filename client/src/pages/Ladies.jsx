import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import SEO from "../components/SEO";
import { imgHero, videoSrc } from "../lib/imageOpt";
import ProductCard from "../components/ProductCard";
import { productsAPI, categoriesAPI } from "../lib/api";
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "../data/demoData";

// ------------------------------------------------------------------
// The Ladies' Edit - a dedicated, fully animated landing page for the
// ladies' collection. It owns its own route (/ladies) and never mixes
// men's pieces into its grid. Category filtering is available for
// The page is locked to gender=ladies and shows the complete ladies’ collection.
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// HERO BACKGROUND MEDIA - paste your Cloudinary URL(s) below.
// Use HERO_IMAGE_URL for a still image, or HERO_VIDEO_URL for a
// looping muted video. Recommended size: 2560 x 1440 px landscape.
// Both can be used together (image shows while the video loads).
// ------------------------------------------------------------------
const HERO_IMAGE_URL = ""; // CLOUDINARY: edits/ladies-hero.jpg
const HERO_VIDEO_URL = "https://res.cloudinary.com/z0afpk9x/video/upload/v1788274096/enhanced_2560x1440.mp4"; // CLOUDINARY (optional): edits/ladies-hero.mp4

const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroText = {
  eyebrow: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0 },
  },
  title: {
    initial: { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0 },
  },
  subtitle: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0 },
  },
};

export default function Ladies() {
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [allProducts, setAllProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ gender: "ladies" }),
        ]);
        if (!cancelled) {
          // Show only Ladies and Unisex category cards on this page
          const sectionCats = (catRes.data.categories || []).filter(
            (c) => !c.gender || c.gender === "ladies" || c.gender === "unisex"
          );
          if (sectionCats.length > 0) setCategories(sectionCats);
          const apiProducts = Array.isArray(prodRes.data?.products) ? prodRes.data.products : [];
          if (apiProducts.length > 0) setAllProducts(apiProducts);
        }
      } catch {
        // Fall back to demo data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    result = result.filter((p) => p.gender === "ladies");
    return result;
  }, [allProducts]);

  return (
    <>
      <SEO
        title="The Ladies' Edit | Zealc.ollection"
        description="The ladies' collection - timepieces, accessories and refined apparel, considered for every day."
      />

      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen"
      >
        {/* ------------------------------------------------------------------
            HERO EDIT BANNER - dark, editorial, distinct from Shop
        ------------------------------------------------------------------ */}
        <section className="edit-hero relative bg-onyx overflow-hidden">
          {/* Background media: image and/or video */}
          {HERO_IMAGE_URL && (
            <img
              src={imgHero(HERO_IMAGE_URL)}
              alt=""
              aria-hidden="true"
              className="edit-hero__media absolute inset-0 w-full h-full object-cover"
            />
          )}
          {HERO_VIDEO_URL && (
            <video
              src={videoSrc(HERO_VIDEO_URL, 1280)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="edit-hero__media absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          {/* Dark scrim so text stays crisp over any media */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
          {/* Subtle gold line motif */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(224,182,71,0.05)_50%,transparent_100%)]" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-14 md:pb-20 relative">
            <motion.p
              {...heroText.eyebrow}
              className="eyebrow mb-6"
            >
              The Ladies' Edit
            </motion.p>
            <motion.h1
              {...heroText.title}
              className="font-display text-onyx-contrast text-5xl md:text-7xl lg:text-[88px] leading-[1.02] text-ivory"
              style={{ color: "#ffffff" }}
            >
              For her,
              <br />
              <span className="text-gold italic">considered.</span>
            </motion.h1>
            <motion.p
              {...heroText.subtitle}
              className="mt-7 max-w-lg text-ivory/70 font-body text-sm md:text-base leading-relaxed"
            >
              Timepieces built to keep the hours, accessories made to hold the
              moments, and pieces that carry themselves without asking.
            </motion.p>

            <motion.div
              {...heroText.subtitle}
              className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              <Link to="/shop?gender=ladies" className="btn-gold inline-flex items-center gap-3">
                Shop the edit
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/men"
                className="inline-flex items-center gap-3 text-ivory/80 hover:text-gold text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors duration-300"
              >
                View the men's edit
              </Link>
            </motion.div>
          </div>

          {/* Gold hairline at the base */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </section>

        {/* ------------------------------------------------------------------
            PRODUCT GRID - staggered fade-up entrance
        ------------------------------------------------------------------ */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-24 md:pb-32 pt-12">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-mist h-[380px]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-24"
            >
              <p className="eyebrow mb-4">Nothing here yet</p>
              <p className="text-onyx/60 font-body text-sm max-w-md mx-auto">
                The ladies' edit is being prepared with care. New pieces arrive
                slowly and are worth the wait.
              </p>
              <Link to="/shop" className="btn-gold mt-8 inline-block">
                Shop all pieces
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial="initial"
              animate="animate"
              variants={{
                animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
              }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id || product.id}
                    variants={{
                      initial: { opacity: 0, y: 30 },
                      animate: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.7,
                          delay: index * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </motion.div>
    </>
  );
}
