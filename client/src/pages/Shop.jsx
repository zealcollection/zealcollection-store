import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";

import SEO from "../components/SEO";
import { imgHero } from "../lib/imageOpt";
import ProductCard, { formatPrice } from "../components/ProductCard";
import { productsAPI, categoriesAPI } from "../lib/api";
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "../data/demoData";

const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

// ------------------------------------------------------------------
// HERO BACKGROUND MEDIA - paste your Cloudinary URL(s) below.
// Use HERO_IMAGE_URL for a still image, or HERO_VIDEO_URL for a
// looping muted video. Recommended size: 2560 x 1440 px landscape.
// Both can be used together (image shows while the video loads).
// ------------------------------------------------------------------
const HERO_IMAGE_URL = "https://res.cloudinary.com/z0afpk9x/image/upload/v1788653626/H.jpg"; // CLOUDINARY: edits/shop-hero.jpg
const HERO_VIDEO_URL = ""; // CLOUDINARY (optional): edits/shop-hero.mp4

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // NOTE: both of these now start EMPTY (not DEMO_CATEGORIES / DEMO_PRODUCTS)
  // so the old demo data never flashes on screen before the real data
  // arrives from the API - same fix as the Home page. See `categoriesList`
  // and `productsForDisplay` below, which only fall back to the demo data
  // once loading has finished (e.g. the API call genuinely failed).
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        // IMPORTANT: always fetch the FULL catalog here, never scoped by
        // gender. This used to call productsAPI.getAll({ gender: ... })
        // whenever the page was first opened with a ?gender= param (e.g.
        // arriving from the Men's/Ladies' edit's "Shop the edit" button).
        // That baked the gender restriction into `allProducts` itself, at
        // the SERVER level, for the entire lifetime of this page visit -
        // so even after clearing the gender filter client-side (e.g. by
        // clicking a category tab), the other gender's products were
        // never actually fetched and "No Products Found" would appear.
        // Fetching everything once and filtering by gender purely
        // client-side (see `filteredProducts` below) fixes this for good.
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll(),
        ]);
        if (!cancelled) {
          if (catRes.data.categories.length > 0) setCategories(catRes.data.categories);
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

  // Sync URL category param
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory !== category) {
      setCategory(urlCategory || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("category")]);

  useEffect(() => {
    const urlGender = searchParams.get("gender");
    if (urlGender !== gender) {
      setGender(urlGender || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("gender")]);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search")]);

  // Categories to render: real ones once fetched, otherwise fall back to
  // the demo set ONLY after loading has finished (e.g. API failed). This
  // keeps the demo category tabs from ever flashing before the real fetch
  // resolves - the same fix used on the Home page.
  const categoriesList = categories.length > 0 ? categories : loading ? [] : DEMO_CATEGORIES;

  // Same treatment for products, for consistency with the categories fix.
  const productsForDisplay = allProducts.length > 0 ? allProducts : loading ? [] : DEMO_PRODUCTS;

  const filteredProducts = useMemo(() => {
    let result = [...productsForDisplay];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category?.name?.toLowerCase().includes(term)
      );
    }
    if (category) {
      result = result.filter(
        (p) => p.category?.slug === category || p.categoryName === category
      );
    }
    if (gender) {
      // "men" | "ladies" matches exactly; "all" includes men, ladies and unisex.
      const allowed = gender === "all" ? ["men", "ladies", "unisex"] : [gender, "unisex"];
      result = result.filter((p) => allowed.includes(p.gender || "unisex"));
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [productsForDisplay, search, category, gender, sort]);

  const clearAllFilters = () => {
    setGender("");
    setCategory("");
    setSort("");
    setSearch("");
    setSearchParams({});
  };

  return (
    <>
      <SEO title="Shop" description="Browse the full Zealc.ollection collection of luxury watches, handbags and nightwear." />

      {/* ------------------------------------------------------------------
          HERO - dark, cinematic, mirrors the Men / Ladies / Unisex edits.
          Paste your Cloudinary URL into HERO_IMAGE_URL above.
      ------------------------------------------------------------------ */}
      <section className="homepage-hero relative bg-onyx overflow-hidden min-h-[calc(100vh-56px)] md:min-h-[calc(100vh+80px)]">
        {/* Placeholder so the hero keeps its cinematic height until an image is pasted */}
        {!HERO_IMAGE_URL && !HERO_VIDEO_URL && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(224,182,71,0.07),rgba(15,15,15,0.98)_75%)]" aria-hidden="true" />
        )}
        {/* Background media: image and/or video */}
        {HERO_IMAGE_URL && (
          <img
            src={imgHero(HERO_IMAGE_URL)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
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
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Dark scrim so text stays crisp over any media */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
        {/* Subtle gold light sweep */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(224,182,71,0.05)_50%,transparent_100%)]" />
        {/* Gold hairline at the base */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      </section>

      {/* Clean category filter bar - categories are managed in the admin panel. */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 md:pt-14">
        {loading && categoriesList.length === 0 ? (
          <div className="flex items-center gap-6 mt-3 border-b border-mist pb-3.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-16 bg-mist animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3 border-b border-mist pb-0"
          >
            {[
              { label: "All", value: "" },
              ...categoriesList.map((c) => ({ label: c.name, value: c.slug })),
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setCategory(tab.value);
                  // These top-level tabs are a general "shop by category"
                  // control, not a gender-scoped one - so using them drops
                  // any leftover gender restriction from arriving here via
                  // the Men's/Ladies' edit ("Shop the edit").
                  setGender("");
                  const params = new URLSearchParams(searchParams);
                  if (tab.value) params.set("category", tab.value);
                  else params.delete("category");
                  params.delete("gender");
                  setSearchParams(params);
                }}
                className={`text-[11px] tracking-[0.2em] uppercase pb-3.5 transition-colors duration-300 ${
                  category === tab.value
                    ? "text-onyx border-b-2 border-gold"
                    : "text-onyx/50 hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] tracking-[0.15em] uppercase text-onyx/50 pb-3.5">
              {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
            </span>
          </motion.div>
        )}
      </section>

      {/* Search + sort bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-mist py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const params = new URLSearchParams(searchParams);
                    if (search.trim()) params.set("search", search.trim());
                    else params.delete("search");
                    setSearchParams(params);
                  }
                }}
                placeholder="Search the collection..."
                aria-label="Search products"
                className="w-full bg-mist pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (search.trim()) params.set("search", search.trim());
                else params.delete("search");
                setSearchParams(params);
              }}
              className="hidden md:block btn-luxury !px-5 !py-3 whitespace-nowrap"
            >
              Search
            </button>
          </div>

          <div className="relative w-full md:w-auto">
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-onyx/50 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="appearance-none bg-mist pl-4 pr-10 py-3 text-[11px] tracking-[0.15em] uppercase focus:outline-none focus:ring-1 focus:ring-gold w-full md:w-auto min-w-0"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          PRODUCT GRID (2 cols mobile/tablet, 4 cols desktop)
      ------------------------------------------------------------------ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-mist aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl mb-3">No Products Found</p>
            <p className="text-onyx/60 text-sm mb-6">
              Try adjusting your search terms.
            </p>
            <button type="button" onClick={clearAllFilters} className="btn-luxury-outline">
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] tracking-[0.15em] uppercase text-onyx/50 mb-6">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </p>
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.5,
                      delay: (index % 6) * 0.06,
                      ease: "easeOut",
                    }}
                  >
                    <ProductCard product={product} index={index % 4} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}