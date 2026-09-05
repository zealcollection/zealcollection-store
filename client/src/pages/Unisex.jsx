import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import SEO from "../components/SEO";
import { imgHero } from "../lib/imageOpt";
import ProductCard from "../components/ProductCard";
import { productsAPI, categoriesAPI } from "../lib/api";
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "../data/demoData";

// ------------------------------------------------------------------
// The Shared Edit (Unisex) - a dedicated, fully animated landing page for
// gender-neutral pieces. It owns its own route (/unisex) and only shows
// products marked unisex. Category filtering is available for refinement
// but the page is locked to gender=unisex.
// ------------------------------------------------------------------

const EDITIONS = [
  { label: "All", value: "" },
  { label: "Watches", value: "watches" },
  { label: "Apparel", value: "apparel" },
  { label: "Accessories", value: "accessories" },
];

// ------------------------------------------------------------------
// HERO BACKGROUND MEDIA - paste your Cloudinary URL(s) below.
// Use HERO_IMAGE_URL for a still image, or HERO_VIDEO_URL for a
// looping muted video. Recommended size: 2560 x 1440 px landscape.
// Both can be used together (image shows while the video loads).
// ------------------------------------------------------------------
const HERO_IMAGE_URL = ""; // CLOUDINARY: edits/unisex-hero.jpg
const HERO_VIDEO_URL = ""; // CLOUDINARY (optional): edits/unisex-hero.mp4

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

export default function Unisex() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [allProducts, setAllProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ gender: "unisex" }),
        ]);
        if (!cancelled) {
          // Show only Unisex category cards on this page
          const sectionCats = (catRes.data.categories || []).filter(
            (c) => !c.gender || c.gender === "unisex"
          );
          if (sectionCats.length > 0) setCategories(sectionCats);
          if (prodRes.data.products.length > 0) setAllProducts(prodRes.data.products);
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

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory !== category) {
      setCategory(urlCategory || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("category")]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (category)
      result = result.filter(
        (p) =>
          (typeof p.category === "string" && p.category === category) ||
          p.category?.slug === category ||
          p.categoryName === category
      );
    // Guarantee only unisex pieces render on this page
    result = result.filter((p) => p.gender === "unisex");
    return result;
  }, [allProducts, category]);

  const editionLinks = useMemo(
    () =>
      EDITIONS.map((ed) => ({
        ...ed,
        slug: ed.value || "all",
      })),
    []
  );

  return (
    <>
      <SEO
        title="The Shared Edit | Zealc.ollection"
        description="The shared collection - pieces made for everyone. Timeless essentials considered for every day."
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
              src={HERO_VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="edit-hero__media absolute inset-0 w-full h-full object-cover"
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
              The Shared Edit
            </motion.p>
            <motion.h1
              {...heroText.title}
              className="font-display text-onyx-contrast text-5xl md:text-7xl lg:text-[88px] leading-[1.02] text-ivory"
              style={{ color: "#ffffff" }}
            >
              For everyone,
              <br />
              <span className="text-gold italic">considered.</span>
            </motion.h1>
            <motion.p
              {...heroText.subtitle}
              className="mt-7 max-w-lg text-ivory/70 font-body text-sm md:text-base leading-relaxed"
            >
              Pieces made without a gender, worn with intention. Essentials that
              belong to everyone and ask nothing of anyone.
            </motion.p>

            <motion.div
              {...heroText.subtitle}
              className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              <Link to="/shop?gender=unisex" className="btn-gold inline-flex items-center gap-3">
                Shop the edit
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/men"
                className="inline-flex items-center gap-3 text-ivory/80 hover:text-gold text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors duration-300"
              >
                View the men's edit
              </Link>
              <Link
                to="/ladies"
                className="inline-flex items-center gap-3 text-ivory/80 hover:text-gold text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors duration-300"
              >
                View the ladies' edit
              </Link>
            </motion.div>
          </div>

          {/* Gold hairline at the base */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        </section>

        {/* ------------------------------------------------------------------
            EDITION TABS - slim, quiet, gold underline on the active edition
        ------------------------------------------------------------------ */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 md:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-mist"
          >
            {editionLinks.map((ed) => (
              <button
                key={ed.value}
                type="button"
                onClick={() => {
                  setCategory(ed.value);
                  const params = new URLSearchParams(searchParams);
                  if (ed.value) params.set("category", ed.value);
                  else params.delete("category");
                  setSearchParams(params);
                }}
                className={`text-[11px] tracking-[0.28em] uppercase pb-3.5 font-semibold transition-colors duration-300 ${
                  category === ed.value
                    ? "text-gold-dark border-b-2 border-gold"
                    : "text-onyx/50 hover:text-onyx"
                }`}
              >
                {ed.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] tracking-[0.15em] uppercase text-onyx/50 pb-3.5">
              {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
            </span>
          </motion.div>
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
                The shared edit is being prepared with care. New pieces arrive
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
