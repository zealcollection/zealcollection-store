import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowUpRight, Star, ArrowLeft } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import SEO from "../components/SEO";
import AnimatedSection from "../components/AnimatedSection";
import ProductCard, { formatPrice } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import NewsletterSection from "../components/NewsletterSection";
import { imgSrc, imgHero, imgCard, FALLBACK_SVG } from "../lib/imageOpt";
import { productsAPI, categoriesAPI, settingsAPI } from "../lib/api";
import {
  DEMO_HERO_IMAGE,
  DEMO_BRAND_STORY_IMAGE,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_TESTIMONIALS,
  DEMO_INSTAGRAM_IMAGES,
} from "../data/demoData";
import { MARQUEE_WORDS } from "../data/marqueeWords";

// ------------------------------------------------------------------
// HERO BACKGROUND - image, slideshow, or video.
// PRIORITY: HERO_VIDEO > slideshow (2+ images) > single HERO_IMAGE.
//
// SINGLE IMAGE: paste one URL into HERO_IMAGE for a static Ken Burns
// photo background.
//
// SLIDESHOW: paste two or more URLs into HERO_SLIDESHOW_IMAGES, separated
// by commas. Each image fades into the next every HERO_SLIDE_DURATION
// seconds with a slow Ken Burns zoom. Recommended 1920x1080 (16:9).
//
// VIDEO: upload an .mp4 to Cloudinary and use its direct .mp4 URL,
// e.g. res.cloudinary.com/.../video/upload/main-hero.mp4
// ------------------------------------------------------------------
const HERO_IMAGE = ""; // CLOUDINARY: brand/hero/main-hero.jpg (single photo)
const HERO_SLIDESHOW_IMAGES = "https://res.cloudinary.com/z0afpk9x/image/upload/v1787785425/handbag_.jpg,https://res.cloudinary.com/z0afpk9x/image/upload/v1787785426/richard_mille_.jpg,https://res.cloudinary.com/z0afpk9x/image/upload/v1787785430/wedding_set_.jpg,https://res.cloudinary.com/z0afpk9x/image/upload/v1787785432/Heels_.png,https://res.cloudinary.com/z0afpk9x/image/upload/v1787785431/Night_apparel.png,https://res.cloudinary.com/z0afpk9x/image/upload/v1787785432/hampers_.jpg"; // CLOUDINARY slideshow: paste multiple URLs separated by commas, e.g.
// "https://res.cloudinary.com/.../hero-1.jpg, https://res.cloudinary.com/.../hero-2.jpg"
const HERO_SLIDE_DURATION = 5; // seconds each slideshow image stays on screen
const HERO_VIDEO = ""; // CLOUDINARY: brand/hero/main-hero.mp4 (video background)
const COLLECTION_IMAGE = ""; // CLOUDINARY: brand/hero/collection-hero.jpg

// ------------------------------------------------------------------
// Category slideshow card - its own component so useState/useEffect
// inside a .map() never violates the rules of hooks.
// ------------------------------------------------------------------
function CategorySlideCard({ category, meta, index }) {
  const [catSlide, setCatSlide] = useState(0);
  const catImages = [category.image, ...(category.images || [])].filter(Boolean);
  const catHasSlideshow = catImages.length > 1;

  useEffect(() => {
    if (!catHasSlideshow) return;
    // Slow, delayed rhythm: first change after 3.5s, then every 6s
    const first = setTimeout(() => {
      setCatSlide(1);
      const id = setInterval(() => {
        setCatSlide((p) => (p + 1) % catImages.length);
      }, 6000);
      return () => clearInterval(id);
    }, 3500);
    return () => clearTimeout(first);
  }, [catHasSlideshow, catImages.length]);

  return (
    <AnimatedSection delay={0.2 + index * 0.18} className="h-full" duration={1.6}>
      <Link
        to={`/shop?category=${category.slug}`}
        className="home-category-card group relative block h-[380px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-sand"
      >
        {catImages.length > 0 ? (
          catImages.map((src, i) => (
            <img
              key={`${category.slug}-${i}`}
              src={imgSrc(src, 1000)}
              alt={`${meta.title} collection ${i + 1}`}
              loading="lazy"
              aria-hidden={i !== catSlide}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out transition-transform duration-[1800ms] ease-out ${
                i === catSlide ? "opacity-100 group-hover:scale-[1.05]" : "opacity-0"
              }`}
              onError={(e) => {
                // Invalid or dead URL - fall back to the elegant placeholder
                // (never remove hidden slides: it breaks the slideshow)
                if (e.target.src !== FALLBACK_SVG) {
                  e.target.src = FALLBACK_SVG;
                }
              }}
            />
          ))
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-sand to-onyx/10 flex items-center justify-center">
            <span className="text-onyx/30 text-xs tracking-[0.3em] uppercase">
              {meta.label}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/60 via-transparent to-transparent" />

        {/* Number + label (top left) */}
        <div className="absolute top-6 left-6">
          <p className="text-[10px] tracking-[0.35em] uppercase text-ivory/85">
            {meta.number} / {meta.label}
          </p>
        </div>

        {/* Title + tagline (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-7">
          <h3 className="font-display text-ivory text-3xl md:text-4xl mb-2">
            {meta.title}
          </h3>
          <p className="text-ivory/80 text-sm font-body italic">
            {meta.tagline}
          </p>
          <span className="mt-4 inline-flex items-center justify-center w-9 h-9 border border-gold text-gold group-hover:bg-gold group-hover:text-onyx transition-colors duration-300">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
    </AnimatedSection>
  );
}

// Category labels matching the reference design: "01 / TIMEPIECES", etc.
const categoryMeta = {
  watches: { number: "01", label: "TIMEPIECES", title: "Watches", tagline: "Precision, pared back." },
  handbags: { number: "02", label: "LEATHER GOODS", title: "Handbags", tagline: "Objects with a point of view." },
  nightwear: { number: "03", label: "AFTER DARK", title: "Nightwear", tagline: "The ritual of slowing down." },
};

// ------------------------------------------------------------------
// CLOUDINARY: Instagram handle (for the gallery section link)
// ------------------------------------------------------------------
const INSTAGRAM_HANDLE = ""; // CLOUDINARY: admin CMS "Instagram handle" overrides this

// ------------------------------------------------------------------
// BEST SELLERS SLIDESHOW - no arrows. Each product crossfades into the
// next every 8 seconds with a long 3s fade, styled like the reference
// hero deck: numbered indicators on the left, dot pagination bottom-right.
// The image slowly zooms while on screen (Ken Burns) and the text block
// fades up with staggered 0.2s delays for a calm, luxurious rhythm.
// ------------------------------------------------------------------
function BestsellersSlideshow({ products, bestSellersImages }) {
  const safeBackdropImages = Array.isArray(bestSellersImages) ? bestSellersImages : [];
  const { addToCart } = useApp();
  const [active, setActive] = useState(0);
  const total = products.length;

  // Advance every 8 seconds with a long, slow crossfade for a calmer,
  // more luxurious rhythm (3-4s of content fully settled before moving on).
  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 8000);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  return (
    <div className="home-bestsellers relative min-h-[760px] sm:min-h-[460px] md:min-h-[560px] max-w-3xl mx-auto">
      {/* ------------------------------------------------------------------
          Optional backdrop slideshow: an image fades in behind each product
          card. Managed from the admin Site Settings tab (Bestsellers
          Images field). The image list cycles in order; leaving the field
          empty keeps the section clean.
      ------------------------------------------------------------------ */}
      {safeBackdropImages.length > 0 &&
        safeBackdropImages.map((img, index) => (
          <div
            key={`bs-bg-${index}`}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
            style={{ opacity: index === active % safeBackdropImages.length ? 1 : 0, pointerEvents: "none" }}
          >
            <img
              src={imgHero(img)}
              alt=""
              className="home-bestsellers__backdrop w-full h-full object-cover opacity-[0.25]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-mist/80" />
          </div>
        ))}

      {/* Stacked product cards with a long, slow crossfade */}
      {products.map((p, index) => (
        <div
          key={p._id}
          className="home-bestsellers__slide absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
          style={{ opacity: index === active % total ? 1 : 0, pointerEvents: index === active % total ? "auto" : "none" }}
        >
          <div className="home-bestsellers__grid grid grid-cols-1 sm:grid-cols-2 gap-6 items-start h-full">
            <div className="home-bestsellers__image relative overflow-hidden bg-ivory aspect-[4/5] sm:aspect-auto sm:h-full">
              {p.images?.[0] ? (
                <div className="relative w-full h-full">
                  {/* Photo gallery: all images of the line crossfade in time with the slideshow */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${p._id}-${index}`}
                      src={imgCard(p.images[index % p.images.length])}
                      alt={p.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  {/* Gallery dots - one per photo of the line */}
                  {p.images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {p.images.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            i === index % p.images.length ? "w-4 bg-gold" : "w-1.5 bg-ivory/60"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-mist to-ivory flex items-center justify-center text-onyx/30 text-xs tracking-[0.3em] uppercase">
                  {p.name}
                </div>
              )}
              <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
                {p.comingSoon ? (
                  <span className="border border-gold bg-ivory/95 text-gold-dark text-[9px] tracking-[0.3em] uppercase font-semibold px-2.5 py-1">Coming Soon</span>
                ) : (
                  p.isNew && (
                    <span className="bg-gold text-onyx text-[9px] tracking-[0.3em] uppercase font-semibold px-2.5 py-1">New Arrival</span>
                  )
                )}
                {p.stock === 0 && (
                  <span className="bg-onyx text-ivory text-[9px] tracking-[0.3em] uppercase font-semibold px-2.5 py-1">Sold Out</span>
                )}
              </div>
            </div>
            <motion.div
              key={index}
              className="home-bestsellers__details flex flex-col justify-center py-2 sm:py-4"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-gold-dark text-[10px] tracking-[0.4em] uppercase font-medium mb-3"
              >
                {p.category?.name || "Featured"}
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-onyx text-2xl md:text-3xl leading-tight mb-2"
              >
                {p.name}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-onyx/60 text-sm font-body leading-relaxed mb-4 line-clamp-3"
              >
                {p.cardDescription || truncateDescription(p.description) || "A piece from the bestsellers edit."}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-onyx font-medium mb-6"
              >
                {formatPrice(p.price)}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4"
              >
                <Link to={`/product/${p.slug}`} className="btn-gold">
                  View piece
                </Link>
                <button
                  type="button"
                  aria-label={`Add ${p.name} to cart`}
                  onClick={() =>
                    addToCart(p, 1, p.variants?.[0] || null, p.colors?.[0] || null, {
                      photoIndex: 0,
                      photoLabel: (p.photoLabels || [])[0] || "",
                      photoUrl: (p.images || [])[0] || "",
                    })
                  }
                  disabled={p.stock === 0 || p.comingSoon}
                  className="text-[10px] tracking-[0.3em] uppercase text-onyx/70 hover:text-gold-dark disabled:opacity-40 underline underline-offset-4 transition-colors"
                >
                  {p.comingSoon ? "Coming Soon" : p.stock === 0 ? "Sold Out" : "Quick add"}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      ))}

      {/* Left edge: numbered indicators */}
      <div className="absolute -left-2 sm:left-[-4.5rem] top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-5">
        {products.map((p, index) => (
          <button
            key={p._id}
            type="button"
            aria-label={`Go to bestseller ${index + 1}`}
            onClick={() => setActive(index)}
            className="flex items-center gap-3 group"
          >
            <span
              className={`text-[11px] tracking-[0.3em] font-medium transition-colors duration-1000 ${
                index === active % total ? "text-gold-dark" : "text-onyx/40 group-hover:text-onyx/70"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`block h-px transition-all duration-1000 ${
                index === active % total ? "w-10 bg-gold-dark" : "w-6 bg-onyx/20 group-hover:bg-onyx/40"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Bottom-right dot pagination */}
      <div className="absolute bottom-0 right-0 z-10 flex items-center gap-2.5">
        {products.map((p, index) => (
          <button
            key={`dot-${p._id}`}
            type="button"
            aria-label={`Go to bestseller ${index + 1}`}
            onClick={() => setActive(index)}
            className={`rounded-full transition-all duration-1000 ${
              index === active % total ? "w-2.5 h-2.5 bg-gold-dark" : "w-1.5 h-1.5 bg-onyx/30 hover:bg-onyx/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Elegant fallback blurb: first ~120 characters of the full description, cut at a word boundary
function truncateDescription(desc = "") {
  if (!desc) return "";
  const cut = desc.slice(0, 120).trim();
  return desc.length > 120 ? cut.slice(0, cut.lastIndexOf(" ")) + "..." : cut;
}

export default function Home() {
  // NOTE: categories now starts EMPTY (not DEMO_CATEGORIES) so the old
  // demo Watches/Handbags/Nightwear cards never flash on screen before
  // the real categories arrive from the API. See the "Collection" section
  // in HeroSections below, which now waits for `loading` to finish (or
  // for real categories to arrive) before rendering anything.
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState(DEMO_TESTIMONIALS);
  const [instagramImages, setInstagramImages] = useState(DEMO_INSTAGRAM_IMAGES);
  const [loading, setLoading] = useState(true);
  const [marqueeWords, setMarqueeWords] = useState(MARQUEE_WORDS);
  const [cmsInstagramHandle, setCmsInstagramHandle] = useState("");
  // Bestsellers section slideshow backdrop images (managed from the admin
  // Site Settings tab). Empty until an admin customises them, so the
  // product cards stay clean.
  const [cmsBestSellersImages, setCmsBestSellersImages] = useState([]);

  useEffect(() => {
    // Load the site settings from the admin CMS. Marquee ribbon words,
    // hero slide text/background overrides and the Instagram handle all
    // fall back to the file defaults below until an admin customises them.
    settingsAPI.get().then((res) => {
      const s = res.data?.settings || {};
      if (Array.isArray(s.marqueeWords) && s.marqueeWords.length > 0) {
        setMarqueeWords(s.marqueeWords);
      }
      if (typeof s.instagramHandle === "string" && s.instagramHandle.trim()) {
        setCmsInstagramHandle(s.instagramHandle.trim().replace(/^@/, ""));
      }
      if (Array.isArray(s.bestSellersImages) && s.bestSellersImages.length > 0) {
        setCmsBestSellersImages(s.bestSellersImages);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // The admin Site Settings panel signals "zeal-settings-updated" (and
    // bumps localStorage zeal.settingsVersion) on every save, so the Home
    // page re-pulls the settings immediately - hero ribbon, Instagram
    // handle and the Bestsellers backdrop images.
    function handleSettingsUpdated() {
      settingsAPI.get().then((res) => {
        const s = res.data?.settings || {};
        if (Array.isArray(s.marqueeWords) && s.marqueeWords.length > 0) {
          setMarqueeWords(s.marqueeWords);
        }
        if (typeof s.instagramHandle === "string" && s.instagramHandle.trim()) {
          setCmsInstagramHandle(s.instagramHandle.trim().replace(/^@/, ""));
        }
        setCmsBestSellersImages(Array.isArray(s.bestSellersImages) ? s.bestSellersImages : []);
      }).catch(() => {});
    }
    window.addEventListener("zeal-settings-updated", handleSettingsUpdated);
    return () => window.removeEventListener("zeal-settings-updated", handleSettingsUpdated);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [catRes, bestRes, newRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getBestSellers(),
          productsAPI.getNewArrivals(),
        ]);
        if (!cancelled) {
          const apiCategories = Array.isArray(catRes.data?.categories) ? catRes.data.categories : [];
          const apiBestSellers = Array.isArray(bestRes.data?.products) ? bestRes.data.products : [];
          const apiNewArrivals = Array.isArray(newRes.data?.products) ? newRes.data.products : [];
          if (apiCategories.length > 0) setCategories(apiCategories);
          if (apiBestSellers.length > 0) setBestSellers(apiBestSellers);
          if (apiNewArrivals.length > 0) setNewArrivals(apiNewArrivals);
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

  const bestSellersList =
    bestSellers.length > 0 ? bestSellers : DEMO_PRODUCTS.slice(0, 4);

  const newArrivalsList =
    newArrivals.length > 0 ? newArrivals : DEMO_PRODUCTS.slice(4, 8);

  // Categories to render: real ones once fetched, otherwise fall back to
  // the demo set ONLY after loading has finished (e.g. API failed). This
  // keeps the demo cards from ever flashing before the real fetch resolves.
  const categoriesList = categories.length > 0 ? categories : loading ? [] : DEMO_CATEGORIES;

  // Slideshow images: split the comma-separated list and trim whitespace.
  const slideshowImages = (HERO_SLIDESHOW_IMAGES || "")
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
  const useSlideshow = slideshowImages.length > 1;

  const heroImage = !useSlideshow ? HERO_IMAGE || DEMO_HERO_IMAGE : slideshowImages[0];
  const heroVideo = HERO_VIDEO || "";
  const collectionImage = COLLECTION_IMAGE || DEMO_BRAND_STORY_IMAGE;

  // Hero slide state: the deck below advances itself every 5 seconds and
  // responds to clicks on the numbered indicators and dots. Slideshow
  // URLs (HERO_SLIDESHOW_IMAGES) now supply per-slide backgrounds instead
  // of driving a separate crossfade.
  const [slideIndex, setSlideIndex] = useState(0);

  return (
    <>
      <SEO
        title="Home"
        description="Zealc.ollection - Luxury watches, handbags and nightwear. A quiet kind of shine, crafted for the beautifully ordinary."
      />

      {/* ------------------------------------------------------------------
          1. HERO - Reference-style slide deck:
          numbered slide indicators on the left (01/02/03), dot pagination
          bottom-left, SCROLL hint bottom-centre, ribbon marquee at bottom.

          SLIDES: paste image URLs into HERO_SLIDE_IMAGES (or leave empty to
          fall back to the default watch/watch/bag demo images). Each slide
          can carry its own eyebrow, headline, description and CTA label.
      ------------------------------------------------------------------ */}
      <HeroDeck
        slideIndex={slideIndex}
        setSlideIndex={setSlideIndex}
        marqueeWords={marqueeWords}
        slideshowImages={slideshowImages}
        heroImage={heroImage}
        heroVideo={heroVideo}
        loading={loading}
      />

      {/* All remaining homepage sections render inside the fragment here */}
      <HeroSections
        categories={categoriesList}
        categoriesLoading={loading && categories.length === 0}
        bestSellersList={bestSellersList}
        newArrivalsList={newArrivalsList}
        loading={loading}
        testimonials={testimonials}
        instagramImages={instagramImages}
        instagramHandle={cmsInstagramHandle || INSTAGRAM_HANDLE}
        collectionImage={collectionImage}
        bestSellersImages={cmsBestSellersImages}
      />
    </>
  );
}



function HeroDeck({ slideIndex, setSlideIndex, marqueeWords, slideshowImages, heroImage, heroVideo, loading }) {
  // Hardcoded slideshow: one slide per image pasted into
  // HERO_SLIDESHOW_IMAGES at the top of this file. No CMS fetching -
  // labels and images render instantly on every refresh.
  const heroSlides = useMemo(() => {
    const images = slideshowImages.length > 0 ? slideshowImages : [heroImage];
    return images.map((bg, i) => ({
      number: String(i + 1).padStart(2, "0"),
      cta: "Shop Now",
      ctaHref: "/shop",
      bg: bg || "",
    }));
  }, [slideshowImages, heroImage]);

  const total = heroSlides.length;
  const active = slideIndex % total;

  // Cycle slides automatically like the reference site (5 s per slide).
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(id);
  }, [total, setSlideIndex]);

  const slide = heroSlides[active];

  // Slide backgrounds: prefer the slide's own bg, then the slideshow list,
  // then the single hero image, then the demo fallback.
  const bgSource = slide.bg || heroImage;

  return (
    <section className="homepage-hero relative min-h-[calc(100vh-56px)] md:min-h-[calc(100vh+80px)] overflow-hidden bg-onyx">
      {/* Background per slide with a slow crossfade */}
      {heroVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : bgSource ? (
        heroSlides.map((s, index) => {
          const rawSrc = s.bg || heroImage;
          return (
            <img
              key={index}
              src={imgHero(rawSrc)}
              alt={`Zealc.ollection hero slide ${index + 1}`}
              className="homepage-hero__media absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out animate-kenburns"
              style={{ opacity: index === active ? 1 : 0 }}
            />
          );
        })
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-onyx via-charcoal to-onyx" />
      )}
      {/* Overlay keeps text readable over any photo.
          The extra top stop (to-onyx/70 md:to-onyx/45) darkens the area behind
          the fixed navbar so the mobile buttons stay legible over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/55 via-onyx/10 to-transparent" />

      {/* Left edge: numbered slide indicators (reference style).
          Owns a fixed left column via translate-x so the text column below
          starts clear of the indicators on every screen size. */}
      <div className="absolute left-8 lg:left-14 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-8">
        {heroSlides.map((s, index) => (
          <button
            key={s.number}
            type="button"
            aria-label={`Go to slide ${s.number}`}
            onClick={() => setSlideIndex(index)}
            className="flex items-center gap-4 group"
          >
            <span
              className={`text-[15px] tracking-[0.25em] font-semibold transition-colors duration-500 ${
                index === active ? "text-gold text-[17px]" : "text-ivory/70 group-hover:text-ivory"
              }`}
            >
              {s.number}
            </span>
            <span
              className={`block h-[2px] transition-all duration-500 ${
                index === active ? "w-12 bg-gold" : "w-8 bg-ivory/50 group-hover:bg-ivory/80"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Clean image-only hero: no headline, label or description.
          The gold button sits in its fixed spot near the bottom of the
          hero, just above the scrolling ribbon strip, and its link is
          generated automatically for each slide (its category). */}
      <motion.div
        key={`cta-${active}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="absolute bottom-24 md:bottom-32 left-4 sm:left-8 lg:left-16 z-10"
      >
        <Link to={slide.ctaHref} className="btn-gold">
          {slide.cta}
        </Link>
      </motion.div>

      {/* Bottom-left dot pagination (reference style) */}
      <div className="absolute bottom-16 left-4 sm:left-8 z-10 flex items-center gap-2.5">
        {heroSlides.map((s, index) => (
          <button
            key={`dot-${s.number}`}
            type="button"
            aria-label={`Go to slide ${s.number}`}
            onClick={() => setSlideIndex(index)}
            className={`rounded-full transition-all duration-300 ${
              index === active ? "w-2.5 h-2.5 bg-gold-light" : "w-1.5 h-1.5 bg-ivory/40 hover:bg-ivory/70"
            }`}
          />
        ))}
      </div>

      {/* Bottom-centre SCROLL hint (reference style) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-ivory/60 text-[10px] tracking-[0.45em] uppercase">Scroll</span>
        <span className="block w-px h-8 bg-gradient-to-b from-gold-light to-transparent animate-pulse" />
      </div>

      {/* Marquee ribbon strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-ivory/15 bg-onyx/60 backdrop-blur-sm overflow-hidden whitespace-nowrap py-4">
        <div className="marquee-track">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center">
              {marqueeWords.map((word, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center mx-8 text-[11px] tracking-[0.35em] uppercase text-ivory/70"
                >
                  {word}
                  <span className="ml-16 text-gold-light" aria-hidden>&#10022;</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// HERO SECTIONS - every homepage section after the hero, extracted so
// the fragment structure stays clean (HeroDeck stays a single element).
// ------------------------------------------------------------------
function HeroSections({ categories, categoriesLoading, bestSellersList, newArrivalsList, loading, testimonials, instagramImages, instagramHandle, collectionImage, bestSellersImages }) {
  return (
    <>

      {/* ------------------------------------------------------------------
          2. THE COLLECTION - Editorial intro
      ------------------------------------------------------------------ */}
      <section className="py-24 md:py-32 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-5">
              The Collection
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.05] max-w-md">
              Made to be noticed slowly.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-onyx/60 text-base leading-relaxed max-w-md font-body"
          >
            Three considered worlds, one quiet standard. Everything we make is
            built around a simple idea: objects for the beautifully ordinary.
          </motion.p>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[380px] sm:h-[480px] lg:h-[560px] bg-sand animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {categories.map((category, index) => {
              const meta = categoryMeta[category.slug] || {
                number: String(index + 1).padStart(2, "0"),
                label: category.name.toUpperCase(),
                title: category.name,
                tagline: "Discover the collection.",
              };
              return <CategorySlideCard key={category._id || category.slug} category={category} meta={meta} index={index} />;
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------
          3. BEST SELLERS CAROUSEL (Swiper)
      ------------------------------------------------------------------ */}
      <section className="bg-mist py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <p className="eyebrow mb-4">Most loved</p>
              <h2 className="section-heading text-3xl md:text-5xl">Bestsellers</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-onyx/70 hover:text-gold-dark transition-colors shrink-0"
            >
              View all pieces <ArrowUpRight size={13} />
            </Link>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-ivory aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <BestsellersSlideshow products={bestSellersList} bestSellersImages={bestSellersImages} />
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------
          4. NEW ARRIVALS
      ------------------------------------------------------------------ */}
      <section className="py-24 md:py-32 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14" delay={0}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow mb-4">Just landed</p>
              <h2 className="section-heading text-3xl md:text-5xl">New Arrivals</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-onyx/70 hover:text-gold-dark transition-colors shrink-0"
              >
                View all pieces <ArrowUpRight size={13} />
              </Link>
            </motion.div>
          </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {newArrivalsList.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------
          5. BRAND STORY (Philosophy)
      ------------------------------------------------------------------ */}
      <section className="bg-sand overflow-x-clip">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative h-[420px] lg:h-[640px] overflow-hidden w-full min-w-0"
          >
            {collectionImage ? (
              <img
                src={imgHero(collectionImage)}
                alt="The Zealc.ollection philosophy"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-onyx/70 to-onyx/40 flex items-center justify-center">
                <span className="font-display text-ivory/25 text-2xl tracking-[0.4em]">
                  ZEAL COLLECTION
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="py-16 lg:py-0 lg:pl-16 xl:pl-24 pr-0 lg:pr-12 min-w-0"
          >
            <p className="text-[11px] tracking-[0.35em] uppercase text-gold mb-5">
              Our Philosophy
            </p>
            <h2 className="font-display text-3xl md:text-5xl mb-6 leading-tight">
              Objects for the beautifully <em className="text-gold">ordinary</em>.
            </h2>
            <p className="text-onyx/60 leading-relaxed mb-5 font-body">
              Zealc.ollection was founded on a singular belief: that true luxury does
              not shout. It is found in the weight of a precisely engineered
              movement, the grain of hand-selected leather, and the fall of
              pure silk against the skin.
            </p>
            <Link to="/about" className="btn-luxury">
              Discover Our Heritage
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          6. WHY SHOP WITH US
      ------------------------------------------------------------------ */}
      <section className="py-24 md:py-32 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <AnimatedSection className="text-center mb-14">
          <p className="eyebrow mb-4">The Zealc.ollection Standard</p>
          <h2 className="section-heading text-3xl md:text-5xl">
            Why Shop With Us
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {[
            {
              icon: "Quality Products",
              text: "We stock carefully selected, top-tier items for durability and performance.",
            },
            {
              icon: "Fast Delivery",
              text: "We process and ship your orders quickly so you get what you need without long delays.",
            },
            {
              icon: "Secure Checkout",
              text: " Our platform uses advanced encryption technology to ensure your personal and payment details are completely safe.",
            },
            {
              icon: "Transparent Pricing",
              text: "We offer fair, competitive prices with no hidden fees or unexpected costs at checkout.",
            },
          ].map((item, index) => (
            <AnimatedSection key={item.icon} delay={0.15 + index * 0.15} className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center border border-gold/40 text-gold">
                <span className="font-display text-lg">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display text-xl mb-3">{item.icon}</h3>
              <p className="text-onyx/60 text-sm leading-relaxed font-body">
                {item.text}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------
          7. TESTIMONIALS
      ------------------------------------------------------------------ */}
      <section className="bg-onyx text-ivory py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="eyebrow mb-4">Client experiences</p>
            <h2 className="font-display text-ivory text-3xl md:text-5xl">
              Reviews from our customers
            </h2>
          </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.name} delay={0.1 + index * 0.15}>
                <div className="border border-ivory/10 p-8 lg:p-10 text-center h-full flex flex-col items-center">
                  {testimonial.image ? (
                    <img
                      src={imgSrc(testimonial.image, 160)}
                      alt={`${testimonial.name} portrait`}
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover mb-5 border-2 border-gold/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-onyx border-2 border-gold/30 mb-5 flex items-center justify-center">
                      <span className="font-display text-ivory/40 text-xl">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} className="text-gold" fill="currentColor" />
                    ))}
                  </div>
                  <p className="font-garamond text-lg italic text-ivory/85 leading-relaxed mb-5">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-ivory font-medium">
                    {testimonial.name}
                  </p>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
                    {testimonial.role}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          8. INSTAGRAM GALLERY
      ------------------------------------------------------------------ */}
      <section className="py-24 md:py-32 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <AnimatedSection className="text-center mb-14">
          <p className="eyebrow mb-4">Follow the journey</p>
          <h2 className="section-heading text-3xl md:text-5xl">@{instagramHandle || "Zealc.ollection"}</h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {instagramImages.map((src, index) => (
            <AnimatedSection key={`ig-${index}`} delay={index * 0.08}>
              <div className="group relative aspect-square overflow-hidden bg-sand">
                {src ? (
                  <img
                    src={imgSrc(src, 520)}
                    alt={`Zealc.ollection Instagram gallery image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onyx/15 text-[10px] tracking-[0.3em] uppercase">
                    Gallery
                  </div>
                )}
                <div className="absolute inset-0 bg-onyx/0 group-hover:bg-onyx/30 transition-colors duration-300 flex items-center justify-center">
                  <InstagramIcon className="text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
