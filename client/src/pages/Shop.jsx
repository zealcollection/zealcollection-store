import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";

import SEO from "../components/SEO";
import { imgHero } from "../lib/imageOpt";
import ProductCard, { formatPrice } from "../components/ProductCard";
import { productsAPI, categoriesAPI } from "../lib/api";
import { DEMO_PRODUCTS, DEMO_CATEGORIES } from "../data/demoData";

const PRICE_OPTIONS = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under 300", min: 0, max: 300 },
  { label: "300 - 600", min: 300, max: 600 },
  { label: "600 - 1000", min: 600, max: 1000 },
  { label: "1000 - 2000", min: 1000, max: 2000 },
  { label: "Above 2000", min: 2000, max: Infinity },
];

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

const COLOR_OPTIONS = [
  "Black",
  "Gold",
  "Silver",
  "Rose Gold",
  "White Gold",
  "Camel",
  "Ivory",
  "Midnight",
  "Champagne",
  "Blush",
  "Graphite",
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [allProducts, setAllProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [gender, setGender] = useState(searchParams.get("gender") || "");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [priceRange, setPriceRange] = useState(PRICE_OPTIONS[0]);
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll(searchParams.get("gender") ? { gender: searchParams.get("gender") } : undefined),
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

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

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
    if (brand) {
      result = result.filter((p) => p.brand === brand);
    }
    if (color) {
      result = result.filter((p) =>
        (p.colors || []).some((c) => c.toLowerCase() === color.toLowerCase())
      );
    }
    if (priceRange.min > 0 || priceRange.max < Infinity) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max
      );
    }
    if (availability === "in-stock") {
      result = result.filter((p) => (p.stock || 0) > 0);
    }
    if (availability === "sold-out") {
      result = result.filter((p) => (p.stock || 0) === 0);
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
  }, [allProducts, search, category, gender, brand, color, priceRange, availability, sort]);

  const activeFilterCount = [
    category,
    brand,
    color,
    availability,
    priceRange.min > 0 || priceRange.max < Infinity ? "price" : "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setGender("");
    setCategory("");
    setBrand("");
    setColor("");
    setPriceRange(PRICE_OPTIONS[0]);
    setAvailability("");
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
      <section className="relative bg-onyx overflow-hidden min-h-[calc(100vh-56px)] md:min-h-[calc(100vh+80px)]">
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3 border-b border-mist pb-0"
        >
          {[
            { label: "All", value: "" },
            ...categories.map((c) => ({ label: c.name, value: c.slug })),
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setCategory(tab.value);
                const params = new URLSearchParams(searchParams);
                if (tab.value) params.set("category", tab.value);
                else params.delete("category");
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

          <div className="flex md:flex-row flex-col gap-3 md:gap-4 md:items-center md:justify-end shrink-0">
            {/* Desktop filters button (opens horizontal filters) */}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen((v) => !v)}
              className={`hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase px-5 py-3 border transition-colors whitespace-nowrap ${
                filterDrawerOpen ? "bg-onyx text-ivory border-onyx" : "border-onyx text-onyx hover:bg-onyx hover:text-ivory"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
              {/* Mobile filters button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className="md:hidden inline-flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] uppercase px-4 py-3 border border-onyx text-onyx whitespace-nowrap flex-1"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative md:ml-0 flex-1 md:flex-none">
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
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {category && (
              <FilterChip label={categories.find((c) => c.slug === category)?.name || category} onRemove={() => setCategory("")} />
            )}
            {brand && <FilterChip label={brand} onRemove={() => setBrand("")} />}
            {color && <FilterChip label={color} onRemove={() => setColor("")} />}
            {availability && <FilterChip label={availability === "in-stock" ? "In Stock" : "Sold Out"} onRemove={() => setAvailability("")} />}
            {(priceRange.min > 0 || priceRange.max < Infinity) && (
              <FilterChip label={priceRange.label} onRemove={() => setPriceRange(PRICE_OPTIONS[0])} />
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] tracking-[0.2em] uppercase text-onyx/60 underline underline-offset-4 hover:text-gold-dark"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <div className="flex gap-10">
          {/* ------------------------------------------------------------------
              DESKTOP HORIZONTAL FILTERS
          ------------------------------------------------------------------ */}
          <AnimatePresence>
            {filterDrawerOpen && (
              <motion.aside
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block w-64 shrink-0 overflow-hidden"
              >
                <div className="border border-mist p-6 space-y-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] tracking-[0.3em] uppercase text-onyx">
                      Filters
                    </h3>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[10px] tracking-[0.2em] uppercase text-onyx/60 hover:text-gold-dark"
                    >
                      Clear
                    </button>
                  </div>
                  <FilterContent
                    categories={categories}
                    category={category}
                    setCategory={setCategory}
                    brand={brand}
                    setBrand={setBrand}
                    color={color}
                    setColor={setColor}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    availability={availability}
                    setAvailability={setAvailability}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ------------------------------------------------------------------
              PRODUCT GRID (2 cols mobile/tablet, 4 cols desktop)
          ------------------------------------------------------------------ */}
          <div className="flex-1">
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
                  Try adjusting your filters or search terms.
                </p>
                <button type="button" onClick={clearAllFilters} className="btn-luxury-outline">
                  Clear All Filters
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
        </div>
      </div>

      {/* ------------------------------------------------------------------
          MOBILE FILTER DRAWER
      ------------------------------------------------------------------ */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-onyx/60 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[320px] max-w-[85vw] bg-ivory shadow-2xl overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-mist sticky top-0 bg-ivory">
                <h3 className="text-[12px] tracking-[0.3em] uppercase text-onyx">
                  Filters
                </h3>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-2 text-onyx"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 py-6 space-y-7">
                <FilterContent
                  categories={categories}
                  category={category}
                  setCategory={setCategory}
                  brand={brand}
                  setBrand={setBrand}
                  color={color}
                  setColor={setColor}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  availability={availability}
                  setAvailability={setAvailability}
                />
              </div>
              <div className="px-5 pb-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setFilterDrawerOpen(false);
                  }}
                  className="flex-1 btn-luxury-outline"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="flex-1 btn-gold"
                >
                  View Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ------------------------------------------------------------------
// Filter content (shared between desktop filters and mobile drawer)
// ------------------------------------------------------------------
function FilterContent({
  categories,
  category,
  setCategory,
  brand,
  setBrand,
  color,
  setColor,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
}) {
  return (
    <>
      {/* Category */}
      <FilterGroup title="Category">
        {categories.map((cat) => (
          <label key={cat._id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="filter-category"
              checked={category === cat.slug}
              onChange={() => setCategory(category === cat.slug ? "" : cat.slug)}
              className="accent-[#d4af37] w-4 h-4"
            />
            <span className="text-sm text-onyx/80">{cat.name}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Brand */}
      <FilterGroup title="Brand">
        {["Zealc.ollection Signature", "Zealc.ollection Atelier", "Maison Zealc.ollection"].map((b) => (
          <label key={b} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="filter-brand"
              checked={brand === b}
              onChange={() => setBrand(brand === b ? "" : b)}
              className="accent-[#d4af37] w-4 h-4"
            />
            <span className="text-sm text-onyx/80">{b}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Color */}
      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(color === c ? "" : c)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase border transition-colors ${
                color === c
                  ? "bg-onyx text-ivory border-onyx"
                  : "border-onyx/20 text-onyx/70 hover:border-onyx"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title="Price">
        {PRICE_OPTIONS.map((range) => (
          <label key={range.label} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="filter-price"
              checked={priceRange.label === range.label}
              onChange={() => setPriceRange(range)}
              className="accent-[#d4af37] w-4 h-4"
            />
            <span className="text-sm text-onyx/80">{range.label}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Availability */}
      <FilterGroup title="Availability">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="filter-availability"
            checked={availability === "in-stock"}
            onChange={() => setAvailability(availability === "in-stock" ? "" : "in-stock")}
            className="accent-[#d4af37] w-4 h-4"
          />
          <span className="text-sm text-onyx/80">In Stock</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="filter-availability"
            checked={availability === "sold-out"}
            onChange={() => setAvailability(availability === "sold-out" ? "" : "sold-out")}
            className="accent-[#d4af37] w-4 h-4"
          />
          <span className="text-sm text-onyx/80">Sold Out</span>
        </label>
      </FilterGroup>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h4 className="text-[10px] tracking-[0.3em] uppercase text-onyx/50 mb-3">
        {title}
      </h4>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 bg-mist px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase text-onyx">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="text-onyx/50 hover:text-gold-dark"
      >
        <X size={12} />
      </button>
    </span>
  );
}
