import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";

// ------------------------------------------------------------------
// Brand logo asset.
// The gold ZC monogram is bundled in client/public/assets/zealc-logo.webp
// (local fallback, always visible). When you have a Cloudinary URL, paste
// it into BRAND_LOGO_URL below and it will take precedence.
// ------------------------------------------------------------------
// TIP: if your Cloudinary logo has a large empty canvas around the monogram
// (it looks tiny), append /w_400,h_400,c_fill,g_center/ before the file name
// so Cloudinary crops the empty margins away and the monogram fills the box.
const BRAND_LOGO_URL = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786549369/Logo_guev1b.png"; // CLOUDINARY: brand/logo.png (paste URL here to override)
const LOCAL_LOGO_SRC = "/assets/zealc-logo.webp";
const BRAND_NAME = "Zealc.ollection";

const drawerLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Men", path: "/men" },
  { label: "Ladies", path: "/ladies" },
  { label: "Unisex", path: "/unisex" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { cartTotals, wishlistState, isAuthenticated, auth, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Fixed navbar: always visible. The background turns opaque/blurred once
  // the page scrolls past the hero, and all page content carries enough
  // top padding to clear the bar.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  // Click-toggle state for the Shop and Blog hubs. Works on touch devices
  // (no hover there) as well as desktop: one tap opens, another tap or a
  // navigation closes it.
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);

  // Dynamic category links for the Products dropdown and mobile drawer,
  // driven by the database (admin Categories tab). Falls back to static
  // links if the API is unavailable.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (!cancelled) setNavCategories(data.categories || []);
      } catch {
        // Keep static links as a safety net
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isHome = location.pathname === "/";

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset drawer and any open menus when route changes
  useEffect(() => {
    setDrawerOpen(false);
    setShopMenuOpen(false);
    setBlogMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Close the hubs and account menu when the user taps anywhere outside them
  useEffect(() => {
    const closeAll = () => {
      setShopMenuOpen(false);
      setBlogMenuOpen(false);
      setAccountMenuOpen(false);
    };
    document.addEventListener("click", closeAll);
    return () => document.removeEventListener("click", closeAll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
    }
    setSearchOpen(false);
    setSearchInput("");
  };

  const solid = scrolled;

  const linkClass = (path) =>
    `inline-block text-[15px] tracking-[0.15em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${
      location.pathname === path
        ? "text-gold-dark"
        : solid
        ? "text-onyx hover:text-gold-dark"
        : "text-ivory hover:text-gold"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 ${
          solid
            ? "bg-ivory/85 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
        style={{
          transition: "background-color 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        <nav className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          {/* Mobile: two cells only - hamburger left, centered logo. Everything else lives in the drawer. */}
          <div className="grid grid-cols-3 items-center gap-1 min-w-0 py-3 md:py-4">
            {/* Left cell: mobile menu button + desktop links */}
            <div className="flex items-center justify-center justify-self-start min-w-0">
              {/* Mobile menu button */}
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
                className={`block md:hidden p-2.5 shrink-0 transition-colors ${
                  solid ? "text-onyx" : "text-ivory"
                }`}
              >
                <Menu size={26} />
              </button>
              <ul className="hidden lg:flex items-center gap-7 whitespace-nowrap">
              <li>
                <Link to="/" className={linkClass("/")}>
                  Home
                </Link>
              </li>
              {/* Shop hub - a plain link on the home page; inside the
                  shopping pages a TAP/CLICK toggles the panel with
                  Shop all / Men / Ladies / Unisex. Works on touch devices
                  (no hover there) and desktop alike. One click opens, a
                  second click closes; clicking outside also closes it. */}
              <li className="relative">
                <Link
                  to="/shop"
                  onClick={(e) => {
                    // Only toggle the panel when we are already inside the
                    // shopping pages; elsewhere Shop behaves as a normal
                    // link to the shop.
                    if (
                      ["/shop", "/men", "/ladies", "/unisex"].includes(location.pathname)
                    ) {
                      e.preventDefault();
                      e.stopPropagation();
                      setShopMenuOpen((prev) => !prev);
                      setBlogMenuOpen(false);
                    }
                  }}
                  aria-expanded={shopMenuOpen}
                  className={`text-[15px] tracking-[0.15em] uppercase font-semibold transition-colors duration-300 inline-flex items-center gap-1.5 ${
                    ["/shop", "/men", "/ladies", "/unisex"].includes(location.pathname)
                      ? "text-gold-dark"
                      : solid
                      ? "text-onyx hover:text-gold-dark"
                      : "text-ivory hover:text-gold"
                  }`}
                >
                  Shop
                </Link>
                {/* Dropdown panel - only active inside the shopping pages,
                    controlled entirely by click state so touch devices
                    can open it the same way as desktop. */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute left-0 top-full pt-2 transition-all duration-300 ${
                    ["/shop", "/men", "/ladies", "/unisex"].includes(location.pathname) && shopMenuOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-1"
                  }`}
                >
                  <div className="bg-ivory shadow-xl border border-mist py-3 w-80">
                    <Link
                      to="/shop"
                      className="block px-5 py-2.5 text-[12px] tracking-[0.18em] uppercase font-semibold text-gold-dark hover:bg-mist"
                    >
                      Shop all pieces
                    </Link>
                    <hr className="my-2 border-mist mx-5" />
                    <div className="py-1">
                      <Link
                        to="/men"
                        className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                      >
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                            Men
                          </span>
                          <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors">
                            The men's edit
                          </span>
                        </span>
                      </Link>
                      <Link
                        to="/ladies"
                        className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                      >
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                            Ladies
                          </span>
                          <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors">
                            The ladies' edit
                          </span>
                        </span>
                      </Link>
                      <Link
                        to="/unisex"
                      className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                    >
                      <span className="flex items-baseline justify-between gap-3 min-w-0">
                        <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                          Unisex
                          </span>
                          <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors">
                            The shared edit
                          </span>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Blog hub - a plain link on the home page; inside the
                  Journal a TAP/CLICK toggles the panel with All stories /
                  Heritage / Watches / Care & Craft / Style Journal.
                  Works on touch devices and desktop alike: one click
                  opens, a second closes; outside clicks also close it. */}
              <li className="relative">
                <Link
                  to="/blog"
                  onClick={(e) => {
                    if (["/blog"].includes(location.pathname)) {
                      e.preventDefault();
                      e.stopPropagation();
                      setBlogMenuOpen((prev) => !prev);
                      setShopMenuOpen(false);
                    }
                  }}
                  aria-expanded={blogMenuOpen}
                  className={`text-[15px] tracking-[0.15em] uppercase font-semibold transition-colors duration-300 inline-flex items-center ${
                    ["/blog"].includes(location.pathname)
                      ? "text-gold-dark"
                      : solid
                      ? "text-onyx hover:text-gold-dark"
                      : "text-ivory hover:text-gold"
                  }`}
                >
                  Blog
                </Link>
                {/* Dropdown panel - only active inside the Journal pages,
                    controlled entirely by click state so touch devices
                    can open it the same way as desktop. */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute left-0 top-full pt-2 transition-all duration-300 ${
                    ["/blog"].includes(location.pathname) && blogMenuOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-1"
                  }`}
                >
                  <div className="bg-ivory shadow-xl border border-mist py-3 w-80">
                    <Link
                      to="/blog"
                      className="block px-5 py-2.5 text-[12px] tracking-[0.18em] uppercase font-semibold text-gold-dark hover:bg-mist"
                    >
                      All stories
                    </Link>
                    <hr className="my-2 border-mist mx-5" />
                    <Link
                      to="/blog?topic=heritage"
                      className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                    >
                      <span className="flex items-baseline justify-between gap-3 min-w-0">
                        <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                          Heritage
                        </span>
                        <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors">
                          The house story
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/blog?topic=watches"
                      className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                    >
                      <span className="flex items-baseline justify-between gap-3 min-w-0">
                        <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                          Watches
                        </span>
                        <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors whitespace-nowrap">
                          Keeping the hours
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/blog?topic=care"
                      className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                    >
                      <span className="flex items-baseline justify-between gap-3 min-w-0">
                        <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                          Care & Craft
                        </span>
                        <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors whitespace-nowrap">
                          Keeping pieces alive
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/blog?topic=style"
                      className="group/item block px-5 py-2.5 hover:bg-mist transition-colors"
                    >
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-[12px] tracking-[0.18em] uppercase font-semibold text-onyx group-hover/item:text-gold-dark transition-colors">
                          Style Journal
                        </span>
                        <span className="text-[10px] tracking-[0.12em] uppercase text-onyx/45 group-hover/item:text-gold-dark transition-colors">
                          Ways to wear
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </li>

              <li>
                <Link to="/about" className={linkClass("/about")}>
                  About
                </Link>
                            </li>
            </ul>
            </div>
            {/* Center cell: Logo - sized per screen so it never pushes the grid to two rows */}
            <Link
              to="/"
              className="flex items-center justify-center mx-auto min-w-0 my-auto"
            >
              <img
                src={BRAND_LOGO_URL || LOCAL_LOGO_SRC}
                alt={`${BRAND_NAME} luxury logo`}
                className="navbar-logo h-24 sm:h-20 md:h-40 w-auto max-w-full object-contain scale-[1.35] sm:scale-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
              />
            </Link>

            {/* Right cell: Contact link + icons - icons stay compact and never wrap */}
            <div className="flex items-center justify-center justify-self-end gap-3 md:gap-5 min-w-0">
              <Link
                to="/contact"
                className={`hidden lg:inline-block text-[15px] tracking-[0.15em] uppercase font-semibold transition-colors duration-300 ${
                  location.pathname === "/contact"
                    ? "text-gold-dark"
                    : solid
                    ? "text-onyx hover:text-gold-dark"
                    : "text-ivory hover:text-gold"
                }`}
              >
                Contact
              </Link>

              <button
                type="button"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                className={`hidden md:block p-2.5 transition-colors ${
                  solid ? "text-onyx hover:text-gold-dark" : "text-ivory hover:text-gold"
                }`}
              >
                <Search size={24} />
              </button>

              <Link
                to="/wishlist"
                aria-label="Open wishlist"
                className={`relative hidden md:block p-2.5 transition-colors ${
                  solid ? "text-onyx hover:text-gold-dark" : "text-ivory hover:text-gold"
                }`}
              >
                <Heart size={24} />
                {wishlistState.items.length > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {wishlistState.items.length}
                  </span>
                )}
              </Link>

              {/* Admin dashboard - visible only to administrators (desktop) */}
              {isAuthenticated && auth?.user?.role === "admin" && (
                <Link
                  to="/admin"
                  aria-label="Admin dashboard"
                  className={`hidden md:block p-2.5 transition-colors ${
                    location.pathname === "/admin"
                      ? "text-gold-dark"
                      : solid
                      ? "text-onyx hover:text-gold-dark"
                      : "text-ivory hover:text-gold"
                  }`}
                  title="Admin Dashboard"
                >
                  <ShieldCheck size={24} />
                </Link>
              )}

              {/* Account: Only visible for logged-in admins to maintain guest-only feel for shoppers */}
              {isAuthenticated && auth?.user?.role === "admin" && (
                <div
                  className="relative hidden md:block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="Open account menu"
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    className={`p-2.5 transition-colors ${
                      solid ? "text-onyx hover:text-gold-dark" : "text-ivory hover:text-gold"
                    }`}
                  >
                    <User size={24} />
                  </button>
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-ivory shadow-xl border border-mist py-2"
                      >
                        <Link
                          to="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2 text-[12px] tracking-[0.15em] uppercase text-onyx hover:bg-mist font-bold"
                        >
                          Admin Panel
                        </Link>
                        <hr className="my-2 border-mist" />
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-[12px] tracking-[0.15em] uppercase text-onyx hover:bg-mist"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Admin Icon */}
              {isAuthenticated && auth?.user?.role === "admin" && (
                <Link
                  to="/admin"
                  aria-label="Open admin"
                  className={`md:hidden p-2.5 shrink-0 transition-colors ${
                    solid ? "text-onyx hover:text-gold-dark" : "text-ivory hover:text-gold"
                  }`}
                >
                  <ShieldCheck size={24} />
                </Link>
              )}

              {/* Cart: always visible in the top bar (desktop and mobile) */}
              <Link
                to="/cart"
                aria-label="Open cart"
                className={`relative p-2.5 transition-colors ${
                  solid ? "text-onyx hover:text-gold-dark" : "text-ivory hover:text-gold"
                }`}
              >
                <ShoppingBag size={24} />
                {cartTotals.itemCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {cartTotals.itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------------
          MOBILE DRAWER (dark theme, huge serif links with gold arrows)
      ------------------------------------------------------------------ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-onyx/60 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-24px", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-24px", opacity: 0 }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[300px] max-w-[82vw] bg-onyx border-r border-gold/15 shadow-2xl overflow-y-auto md:hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.35 }}
                className="flex flex-col items-center gap-4 px-7 py-6 border-b border-gold/20"
              >
                <img
                  src={BRAND_LOGO_URL || LOCAL_LOGO_SRC}
                  alt={`${BRAND_NAME} logo`}
                  className="h-24 w-auto max-w-[190px] object-contain scale-[1.45] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-gold/80 hover:text-gold transition-colors self-end -mt-16"
                >
                  <X size={18} />
                </button>
              </motion.div>

              <nav className="px-7 py-7 pb-32">
                {/* Collection header */}
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70 mb-4">
                  The Collection
                </p>
                <ul className="space-y-3">
                  {[...drawerLinks].map((link, index) => (
                    <motion.li
                      key={link.path}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + index * 0.05, duration: 0.35, ease: "easeOut" }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setDrawerOpen(false)}
                        className="block py-1.5 font-display text-[17px] text-gold/90 hover:text-gold transition-colors"
                        style={{ letterSpacing: "0.02em" }}
                      >
                        {link.label}
                      </Link>
                      <div className="h-px bg-gold/10 mt-3" />
                    </motion.li>
                  ))}
                </ul>

                {/* Drawer search */}
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + (drawerLinks.length) * 0.05 + 0.08, duration: 0.35 }}
                  onSubmit={(e) => {
                    if (searchInput.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
                      setDrawerOpen(false);
                    }
                  }}
                  className="relative mt-9"
                >
                  <Search
                    size={15}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gold/70"
                  />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search the collection..."
                    aria-label="Search"
                    className="w-full bg-onyx border-b border-gold/40 text-gold/90 py-3 pl-7 pr-4 text-sm font-light focus:outline-none placeholder:text-ivory/35"
                  />
                </motion.form>

                {/* Drawer utility actions: wishlist, cart, and admin access */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.12 + (drawerLinks.length) * 0.05 + 0.16,
                    duration: 0.35,
                  }}
                  className="mt-9 border-t border-gold/15 pt-6 space-y-0"
                >
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold/70 mb-3">
                    My Zealc.ollection
                  </p>
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between py-3 border-b border-gold/10 text-[11px] tracking-[0.2em] uppercase text-gold/75 hover:text-gold transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={14} className="text-gold" /> Wishlist
                    </span>
                    {wishlistState.items.length > 0 && (
                      <span className="bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                        {wishlistState.items.length}
                      </span>
                    )}
                  </Link>
                  {isAuthenticated && auth?.user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 py-3 border-b border-gold/10 text-[11px] tracking-[0.2em] uppercase text-gold/75 hover:text-gold transition-colors"
                    >
                      <ShieldCheck size={14} className="text-gold" /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/cart"
                    className="flex items-center justify-between py-3 border-b border-gold/10 text-[11px] tracking-[0.2em] uppercase text-gold/75 hover:text-gold transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag size={14} className="text-gold" /> Bag
                    </span>
                    {cartTotals.itemCount > 0 && (
                      <span className="bg-gold text-onyx text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                        {cartTotals.itemCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------
          SEARCH OVERLAY
      ------------------------------------------------------------------ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-onyx/90 flex items-start justify-center pt-32 px-4"
          >
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gold"
                />
                <input
                  autoFocus
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search the collection..."
                  className="w-full bg-transparent border-b border-gold text-ivory py-4 pl-12 pr-12 text-lg font-light focus:outline-none placeholder:text-ivory/50"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gold hover:text-gold-light"
                >
                  <ChevronDown size={20} className="rotate-[-90deg]" />
                </button>
              </form>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="mt-10 text-ivory/70 hover:text-ivory text-[11px] tracking-[0.3em] uppercase"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
