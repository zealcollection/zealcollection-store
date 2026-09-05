import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { imgCard, OptimisedImg } from "../lib/imageOpt";

export default function ProductCard({ product, index = 0 }) {
  const { wishlistState, toggleWishlist, addToCart } = useApp();
  const photos = (product.images || []).filter(Boolean);

  const inWishlist = wishlistState.items.includes(product._id);

  // ------------------------------------------------------------------
  // Gallery: cycle through all product photos on hover / tap.
  // All photos are pre-rendered and stacked; the active one is revealed
  // with a soft opacity crossfade so the switch is never abrupt.
  // ------------------------------------------------------------------
  const multi = photos.length > 1;
  const [idx, setIdx] = useState(0);
  const isHovering = useRef(false);
  const cycleTimer = useRef(null);
  const isTouch = useRef(false);
  // When the shopper navigates manually (arrow / tap), respect their choice:
  // the auto-cycle does not resume while the cursor is still over the card,
  // and it will not override the manual selection until the next hover.
  const manuallySet = useRef(false);

  const go = useCallback(
    (dir) => {
      // Manual navigation overrides the cycle - the picked photo stays on screen.
      manuallySet.current = true;
      if (cycleTimer.current) {
        window.clearTimeout(cycleTimer.current);
        window.clearInterval(cycleTimer.current);
        cycleTimer.current = null;
      }
      setIdx((i) => (i + dir + photos.length) % photos.length);
    },
    [photos.length],
  );

  // Desktop hover: cycle one photo at a time (delayed & smooth).
  // First step happens after 1.2s, then every 2.2s — unhurried, editorial.
  // The cycle only runs if the shopper has NOT moved the gallery manually;
  // manual arrow clicks take priority and silence the auto-cycling.
  const startCycle = () => {
    manuallySet.current = false;
    if (cycleTimer.current) window.clearTimeout(cycleTimer.current);
    cycleTimer.current = window.setTimeout(() => {
      if (!isHovering.current) return;
      setIdx((i) => (i + 1 + photos.length) % photos.length);
      cycleTimer.current = window.setInterval(() => {
        if (!isHovering.current) return;
        setIdx((i) => (i + 1 + photos.length) % photos.length);
      }, 2200);
    }, 1200);
  };

  const onEnter = () => {
    if (!multi) return;
    isHovering.current = true;
    startCycle();
  };

  const onLeave = () => {
    if (cycleTimer.current) {
      window.clearTimeout(cycleTimer.current);
      window.clearInterval(cycleTimer.current);
      cycleTimer.current = null;
    }
    isHovering.current = false;
    manuallySet.current = false;
    // Ease back to the cover photo when the cursor leaves.
    // Manual navigation is only honoured while hovering; leaving resets
    // the card to its cover image so every card restarts from the top.
    setIdx(0);
  };

  useEffect(() => () => {
    if (cycleTimer.current) window.clearInterval(cycleTimer.current);
  }, []);

  // Arrows: stop every event so the card's link never opens, then advance.
  const stopAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation && e.nativeEvent.stopImmediatePropagation();
  };

  const handlePrev = (e) => {
    stopAll(e);
    go(-1);
  };

  const handleNext = (e) => {
    stopAll(e);
    go(1);
  };

  // Touch devices: tapping an arrow or swiping the card cycles the photos.
  const handleCardTap = (e) => {
    if (!multi || isTouch.current) return;
    const target = e.target;
    if (target.closest("button")) return; // arrows handled above
    // Tap on the photo itself advances to the next photo once.
    go(1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  // Quick Add carries the photo the shopper is currently looking at so the
  // cart records exactly this item (via photoIndex + label + photo URL),
  // not just the first item of the card.
  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.length > 0 ? product.variants[0] : null;
    const color = product.colors?.length > 0 ? product.colors[0] : null;
    const photoLabel = (product.photoLabels || [])[idx] || "";
    const photoUrl = photos[idx] || "";
    addToCart(product, 1, variant, color, { photoIndex: idx, photoLabel, photoUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div
          className="relative overflow-hidden bg-mist aspect-[3/4] select-none"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onTouchStart={() => (isTouch.current = true)}
          onTouchEnd={() => (isTouch.current = false)}
        >
          {/* Pre-rendered photo stack: smooth opacity crossfade, never clipped */}
          {photos[0] ? (
            <>
              {photos.map((src, i) => (
                <OptimisedImg
                  key={i}
                  src={imgCard(src)}
                  alt={`${product.name} — photo ${i + 1}`}
                  aria-hidden={i !== idx}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    i === idx ? "opacity-100 zo-fade-in" : "opacity-0"
                  } group-hover:scale-[1.03] group-hover:duration-[1800ms]`}
                />
              ))}

              {/* Gallery dot indicators */}
              {multi && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === idx ? "w-4 bg-gold" : "w-1.5 bg-ivory/70"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Gallery arrows - tap/click to browse the collection on the card */}
              {multi &&
                [
                  { Icon: ChevronLeft, dir: -1, side: "left-1.5" },
                  { Icon: ChevronRight, dir: 1, side: "right-1.5" },
                ].map(({ Icon, dir, side }) => (
                  <button
                    key={side}
                    type="button"
                    aria-label={dir === -1 ? "Previous photo" : "Next photo"}
                    onClick={dir === -1 ? handlePrev : handleNext}
                    onPointerDown={stopAll}
                    className={`absolute top-1/2 -translate-y-1/2 ${side} z-10 p-2 bg-ivory/90 backdrop-blur-sm text-onyx opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hover:bg-gold md:hover:text-onyx md:hover:scale-110 transform`}
                  >
                    <Icon size={16} strokeWidth={1.5} />
                  </button>
                ))}

              {/* Tap-to-cycle layer for touch devices (no hover on phones) */}
              {multi && (
                <div
                  className="absolute inset-0 z-[1] md:hidden"
                  onPointerUp={handleCardTap}
                  aria-hidden="true"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-onyx/20 text-xs tracking-widest uppercase">
              Image Coming Soon
            </div>
          )}

          {/* Status badges - stacked in one corner so they never overlap */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-20">
            {/* New Arrival badge */}
            {product.isNew && !product.comingSoon && (
              <span className="bg-gold text-onyx text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-semibold">
                New Arrival
              </span>
            )}
            {/* Coming Soon badge - announced but not yet purchasable */}
            {product.comingSoon && (
              <span className="border border-gold bg-ivory/95 text-gold-dark text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-semibold">
                Coming Soon
              </span>
            )}
            {/* Out of stock badge */}
            {product.stock === 0 && (
              <span className="bg-onyx text-ivory text-[9px] tracking-[0.2em] uppercase px-3 py-1.5">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist button - always visible on touch devices, hover-reveal on desktop */}
          <button
            type="button"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishlist}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className={`absolute top-3 right-3 p-2.5 bg-ivory/90 backdrop-blur-sm z-20 transition-all duration-300 md:opacity-0 md:translate-y-[-8px] md:group-hover:opacity-100 md:group-hover:translate-y-0 ${
              inWishlist ? "opacity-100 translate-y-0 text-gold-dark" : "text-onyx"
            }`}
          >
            <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
          </button>

          {/* Quick add button - always visible on touch devices, hover-reveal on desktop */}
          <button
            type="button"
            onClick={handleQuickAdd}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={product.stock === 0 || product.comingSoon}
            className="absolute bottom-0 left-0 right-0 bg-onyx/90 text-ivory text-[10px] tracking-[0.25em] uppercase py-3.5 z-20 md:opacity-0 md:translate-y-full md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 md:hover:bg-gold md:hover:text-onyx disabled:pointer-events-none disabled:bg-onyx/70"
          >
            {product.comingSoon ? "Coming Soon" : product.stock === 0 ? "Sold Out" : "Quick Add"}
          </button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold-dark mb-1">
            {product.category?.name || product.categoryName || "Luxury"}
          </p>
          <h3 className="font-display text-base md:text-lg text-onyx group-hover:text-gold-dark transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-sm text-onyx/70 font-body">
            {product.price ? formatPrice(product.price) : ""}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
