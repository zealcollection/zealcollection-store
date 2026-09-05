// ------------------------------------------------------------------
import { useState, useRef, useEffect } from "react";

// ------------------------------------------------------------------
// Image clarity helper
// ------------------------------------------------------------------
// Small thumbnails and upscaled AI-enhanced photos look soft when the
// browser receives the full-resolution file and downscales it with its
// default smoothing, or when the source is smaller than the display
// size multiplied by the screen's device pixel ratio (retina = 2x-3x).
//
// For Cloudinary images this helper injects delivery parameters:
//   - q_<quality> : JPEG/WebP encoding quality (higher = crisper)
//   - f_auto      : best modern format for the viewer's browser
//   - w_<width>   : serve an image sized to the slot, avoiding an
//                   unnecessarily small source that looks pixelated
//                   when displayed at 2x device pixels.
// Local uploads (/uploads/products/...) and raw URLs from the CMS are
// passed through untouched (we cannot transform local files on the fly).
// ------------------------------------------------------------------

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isCloudinaryUrl(url) {
  return typeof url === "string" && url.trim().startsWith("http") && url.includes(CLOUDINARY_HOST);
}

// Insert /q_<q>,f_auto/ (and optional /w_<w>/) right after the "upload" segment
// so the transformation applies to the stored image.
function buildCloudinaryUrl(rawUrl, width, quality, cropToFit = false) {
  let url = rawUrl.trim();
  // Avoid double-applying on an already-transformed URL
  if (/\/q_\d+,?f_auto\/|\/w_\d+\//.test(url)) {
    return url;
  }
  const idx = url.indexOf("/upload/");
  if (idx === -1) return url; // e.g. /image/fetch paths — leave as is
  const insertPoint = idx + "/upload".length;
  // c_limit: never upscale beyond the slot width; the image keeps its
  // full quality but drops every pixel the layout cannot display.
  const sizePart = width ? `/w_${width}${cropToFit ? ",c_limit" : ""}` : "";
  const tail = url.slice(insertPoint);
  // q_auto:eco lets Cloudinary fine-tune quality per image beyond the
  // fixed q_ value, which cuts payload on large source files.
  return `${url.slice(0, insertPoint)}${sizePart}/q_${quality},q_auto:eco,f_auto${tail}`;
}

// Sizes (CSS pixels). The helper doubles them for retina displays
// internally so the browser downloads at least 2x the slot size — but
// each slot also has a hard delivery cap so we never request a
// multi-megabyte file for a small screen slot.
export const IMG_SIZES = {
  thumb: 200,    // cart line, admin order, tiny tiles
  swatch: 280,   // colour swatch previews, category tiles
  card: 640,     // shop card cover, gallery tiles
  detail: 1000,  // product page main image (displayed ~700px)
  hero: 1600,    // hero/category/blog backdrops
};

// Hard delivery caps per slot (CSS px). Prevents retina math from
// requesting 2400px+ files for slots that can never show them.
export const IMG_MAX_WIDTH = {
  thumb: 400,
  swatch: 560,
  card: 1280,
  detail: 1600,
  hero: 1920,
};

// High quality for photos: 85 keeps AI-enhanced detail while limiting
// bandwidth; 90 for hero/product-detail slots.
export const IMG_QUALITY = 85;
export const IMG_QUALITY_DETAIL = 90;

/**
 * Returns a crisp delivery URL for the image.
 * @param {string} url  raw Cloudinary link (or any other URL, passed through)
 * @param {number} size CSS pixel width the image will be displayed at
 * @param {number} [quality] optional quality override (default 85)
 */
export function imgSrc(url, size = IMG_SIZES.card, quality = IMG_QUALITY) {
  if (!isCloudinaryUrl(url)) return url || "";
  // Multiply by device pixel ratio (min 2 for retina) so retina screens
  // get a source at least 2x the display size -> sharp thumbnails.
  let targetWidth = Math.round(size * Math.max(2, window.devicePixelRatio || 1));
  // Cap the delivery width per slot so retina math never pulls a
  // multi-megabyte file onto a slow connection. Map the requested slot
  // size back to its cap.
  const maxBySlot = IMG_MAX_WIDTH[size] || IMG_MAX_WIDTH.card;
  targetWidth = Math.min(targetWidth, maxBySlot);
  // Ask Cloudinary to crop to the exact slot proportions too (avoids
  // shipping a taller file than the slot can ever show) while keeping
  // every pixel of the subject visible.
  return buildCloudinaryUrl(url, targetWidth, quality, true);
}

/** Crisp URL for small slots (cart thumbnails, admin tiles). */
export function imgThumb(url) {
  return imgSrc(url, IMG_SIZES.thumb, IMG_QUALITY);
}

/** Crisp URL for card covers and gallery tiles. */
export function imgCard(url) {
  return imgSrc(url, IMG_SIZES.card, IMG_QUALITY);
}

/** Crisp URL for the product detail main image. */
export function imgDetail(url) {
  return imgSrc(url, IMG_SIZES.detail, IMG_QUALITY_DETAIL);
}

/** Crisp URL for hero/category/blog backdrops. */
export function imgHero(url) {
  return imgSrc(url, IMG_SIZES.hero, IMG_QUALITY_DETAIL);
}

// ------------------------------------------------------------------
// Broken-image fallback
// ------------------------------------------------------------------
// If a Cloudinary link has been deleted or never uploaded, the <img>
// simply shows nothing (a blank card). This handler swaps the source
// to a soft branded placeholder so the card always looks intentional.
export const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160">` +
  `<rect width="120" height="160" fill="#f5f2ec"/>` +
  `<text x="60" y="76" font-family="Georgia,serif" font-size="20" fill="#c9a227" text-anchor="middle">ZC</text>` +
  `<text x="60" y="100" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2" fill="#8a8a85" text-anchor="middle">PHOTO COMING SOON</text>` +
  `</svg>`
)}`;

export function handleImgError(e) {
  const el = e.currentTarget;
  if (el.dataset.fallbackHandled) return;
  el.dataset.fallbackHandled = "1";
  el.src = FALLBACK_SVG;
}

// ------------------------------------------------------------------
// Slow-load graceful reveal (blur-up fade-in)
// ------------------------------------------------------------------
// Large photos arrive over slow connections in stages. This component
// keeps the image invisible (with a tiny blur applied) until the
// browser finishes downloading it, then fades it in over 0.8s so the
// shopper never sees a half-loaded photo on screen.
//
// Usage:
//   <OptimisedImg src={imgDetail(url)} alt="..." className="..." />
//   <OptimisedImg src={imgCard(url)} alt="..." fill className="..." />  // stacked card photos
// ------------------------------------------------------------------
export function OptimisedImg({ src, alt, className = "", fill = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);

  // Cached images can fire `complete` before React attaches onLoad,
  // leaving the picture frozen invisible. Detect that here.
  const imageRef = useRef(null);
  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;
    if (el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  // While the photo is still downloading it stays hidden (opacity-0).
  // The fade-in animation itself is left to the caller's classes (see
  // zo-fade-in in index.css used by the galleries) so this component
  // never fights with the Tailwind opacity classes that drive the
  // card crossfade, the detail-page switches, and the colour swaps.
  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading="lazy"
      onError={handleImgError}
      onLoad={() => setLoaded(true)}
      {...rest}
      className={`${className} ${!loaded ? "opacity-0" : ""}`.trim()}
    />
  );
}

// (useState import moved to top)
