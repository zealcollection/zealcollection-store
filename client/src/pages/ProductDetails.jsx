import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import SEO from "../components/SEO";
import ProductCard, { formatPrice } from "../components/ProductCard";
import { productsAPI, reviewsAPI, wishlistAPI } from "../lib/api";
import { useApp } from "../context/AppContext";
import { DEMO_PRODUCTS } from "../data/demoData";
import { imgSrc, imgDetail, OptimisedImg } from "../lib/imageOpt";

export default function ProductDetails() {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistState, isAuthenticated, auth } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [related, setRelated] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await productsAPI.getBySlug(slugOrId);
        if (!cancelled) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setSelectedVariant(data.product.variants?.[0] || "");
          setSelectedColor(data.product.colors?.[0] || "");
        }
      } catch {
        const fallback = DEMO_PRODUCTS.find(
          (p) => p.slug === slugOrId || p._id === slugOrId
        );
        if (fallback && !cancelled) {
          setProduct(fallback);
          setSelectedVariant(fallback.variants?.[0] || "");
          setSelectedColor(fallback.colors?.[0] || "");
        } else if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slugOrId]);

  // Load related products when product is ready
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    async function loadRelated() {
      try {
        const { data } = await productsAPI.getRelated(product._id);
        if (!cancelled && data.products?.length > 0) setRelated(data.products);
      } catch {
        const others = DEMO_PRODUCTS.filter(
          (p) => p._id !== product._id && p.category?._id === product.category?._id
        );
        if (!cancelled) setRelated(others.slice(0, 4));
      }
    }
    loadRelated();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const images = useMemo(() => {
    if (!product?.images) return [];
    return product.images.length > 0 ? product.images : [""];
  }, [product]);

  // ------------------------------------------------------------------
  // Speed: once the product loads, quietly pre-download every gallery
  // photo at full detail quality so clicking Next / a colour swatch
  // shows the new photo instantly instead of waiting for a network
  // round trip. Thumbnails are small (280px) so they load fast anyway.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!images.length) return;
    images.forEach((img, i) => {
      if (i === 0) return; // the cover is already rendering
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imgDetail(img);
      document.head.appendChild(link);
      return () => link.remove();
    });
  }, [images]);

  // ------------------------------------------------------------------
  // COLOUR IMAGES - when a colour is selected and it has its own photo,
  // the gallery jumps to that photo. Falls back to the current image
  // when no colour photo exists for the selected colour.
  // ------------------------------------------------------------------
  const colorImage = useMemo(() => {
    if (!product?.colorImages || !selectedColor) return "";
    const match = product.colorImages.find(
      (c) => c.color.toLowerCase() === selectedColor.toLowerCase()
    );
    return match?.image || "";
  }, [product, selectedColor]);

  // When the selected colour gets its own photo, show it in the gallery
  const displayImage = colorImage ? colorImage : images[selectedImage];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // If this colour has a matching photo, reset the gallery to it
    const match = (product?.colorImages || []).find(
      (c) => c.color.toLowerCase() === color.toLowerCase()
    );
    if (match?.image && images.includes(match.image)) {
      setSelectedImage(images.indexOf(match.image));
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const inWishlist = product ? wishlistState.items.includes(product._id) : false;

  // The item added matches the photo the shopper is currently looking at:
  // the main gallery photo at selectedImage, unless a colour swatch gave it
  // its own photo (colorImage), which overrides the gallery index visually.
  const currentPhoto = useMemo(() => {
    if (!product) return { photoIndex: 0, photoLabel: "", photoUrl: "" };
    const url = colorImage || images[selectedImage] || "";
    let idx = colorImage && images.includes(colorImage) ? images.indexOf(colorImage) : selectedImage;
    return {
      photoIndex: idx,
      photoLabel: (product.photoLabels || [])[idx] || "",
      photoUrl: url,
    };
  }, [product, colorImage, images, selectedImage]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant, selectedColor, currentPhoto);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedVariant, selectedColor, currentPhoto);
    navigate("/checkout");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    try {
      setReviewSubmitting(true);
      const { data } = await reviewsAPI.create({
        product: product._id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      setReviews(data.reviews || [data.review, ...reviews]);
      setReviewFormOpen(false);
      setReviewComment("");
      setReviewTitle("");
      setReviewRating(5);
    } catch (err) {
      // Error surfaced via toast from api interceptor
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] max-w-[1440px] mx-auto px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEO title="Product Not Found" />
        <div className="max-w-[1440px] mx-auto px-4 py-32 text-center">
          <p className="font-display text-2xl mb-3">Product Not Found</p>
          <p className="text-onyx/60 text-sm mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link to="/shop" className="btn-luxury">
            Return to Shop
          </Link>
        </div>
      </>
    );
  }

  const isSoldOut = product.stock === 0;

  return (
    <>
      <SEO title={product.name} description={product.description} />

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px]"
      >
        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-onyx/50 min-w-0">
          <Link to="/" className="hover:text-gold-dark transition-colors shrink-0">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-dark transition-colors shrink-0">Shop</Link>
          <span>/</span>
          {product.category?.slug && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-gold-dark transition-colors shrink-0">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-onyx truncate">{product.name}</span>
        </nav>
      </motion.div>

      {/* Product section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="zoom-lens bg-mist aspect-[4/5] relative mb-4">
              {displayImage ? (
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  src={imgDetail(displayImage)}
                  alt={`${product.name} - ${selectedColor ? selectedColor + " colour" : `view ${selectedImage + 1}`}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  style={{ willChange: "opacity, transform" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-onyx/20 text-xs tracking-widest uppercase">
                  Image Coming Soon
                </div>
              )}
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-gold text-onyx text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-semibold">
                  New
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setSelectedImage((i) => (i - 1 + images.length) % images.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/90 p-2 hover:bg-ivory"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setSelectedImage((i) => (i + 1) % images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/90 p-2 hover:bg-ivory"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`aspect-square overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-gold" : "border-transparent"
                    }`}
                  >
                    {img ? (
                      <OptimisedImg
                        src={imgSrc(img, 280)}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover zo-fade-in"
                      />
                    ) : (
                      <div className="w-full h-full bg-mist" />
                    )}
                    {/* Photo label shown under labelled photos */}
                    {(product.photoLabels || [])[index] ? (
                      <span className="mt-1.5 block text-center text-[9px] tracking-[0.18em] uppercase text-onyx/50 truncate">
                        {(product.photoLabels || [])[index]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="eyebrow mb-3"
            >
              {product.category?.name || "Luxury Collection"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-3xl md:text-4xl text-onyx mb-3"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={star <= Math.round(averageRating) ? "text-gold" : "text-onyx/20"}
                    fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs text-onyx/50">
                {averageRating > 0
                  ? `${averageRating.toFixed(1)} · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
                  : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`}
              </span>
              <button
                type="button"
                onClick={() => setReviewFormOpen((v) => !v)}
                className="text-[10px] tracking-[0.2em] uppercase text-gold-dark underline underline-offset-4 hover:text-gold"
              >
                Write a Review
              </button>
            </div>

            <p className="font-display text-2xl text-onyx mb-6">
              {formatPrice(product.price)}
            </p>

            {/* Currently viewed item label - tells the shopper exactly which
                photo/item will be added when they press Add to Cart */}
            {currentPhoto.photoLabel && (
              <p className="-mt-4 mb-6 text-[10px] tracking-[0.22em] uppercase text-gold-dark">
                Selected: {currentPhoto.photoLabel}
              </p>
            )}

            <p className="text-onyx/70 leading-relaxed mb-8 font-body">
              {product.description}
            </p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] tracking-[0.25em] uppercase text-onyx mb-3">
                  Size / Variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
                        selectedVariant === variant
                          ? "bg-onyx text-ivory border-onyx"
                          : "border-onyx/25 text-onyx hover:border-onyx"
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] tracking-[0.25em] uppercase text-onyx mb-3">
                  COLOUR: <span className="text-gold-dark">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      aria-label={`Select color ${color}`}
                      className={`w-9 h-9 border-2 transition-all ${
                        selectedColor === color
                          ? "border-gold ring-2 ring-gold/40 ring-offset-2"
                          : "border-onyx/20"
                      }`}
                      style={{ backgroundColor: colorToHex(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-onyx/25">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3.5 text-onyx hover:text-gold-dark"
                  disabled={isSoldOut}
                >
                  <Minus size={15} />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="p-3.5 text-onyx hover:text-gold-dark"
                  disabled={isSoldOut}
                >
                  <Plus size={15} />
                </button>
              </div>
              <span className={`text-[11px] tracking-[0.15em] uppercase ${isSoldOut ? "text-red-700" : "text-onyx/50"}`}>
                {isSoldOut ? "Sold Out" : product.stock > 10 ? "In Stock" : `Only ${product.stock} Left`}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="btn-luxury flex-1 disabled:opacity-50 disabled:pointer-events-none"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className="btn-gold flex-1 disabled:opacity-50 disabled:pointer-events-none"
              >
                Buy Now
              </button>
              <button
                type="button"
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggleWishlist(product._id)}
                className={`p-4 border transition-colors ${
                  inWishlist
                    ? "border-gold text-gold"
                    : "border-onyx/40 text-onyx hover:border-gold"
                }`}
              >
                <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Delivery & Returns */}
            <div className="border-t border-mist pt-6 space-y-4">
              <div className="flex items-start gap-4">
                <Truck size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-medium mb-1">
                    Complimentary Delivery
                  </p>
                  <p className="text-sm text-onyx/60">
                    Insured express shipping on all orders, presented in
                    signature Zealc.ollection packaging.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <RotateCcw size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-medium mb-1">
                    30-Day Returns
                  </p>
                  <p className="text-sm text-onyx/60">
                    Return any unworn item in its original condition within 30
                    days for a full refund.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <ShieldCheck size={18} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase font-medium mb-1">
                    Two-Year Warranty
                  </p>
                  <p className="text-sm text-onyx/60">
                    Every timepiece and leather good is protected by our
                    comprehensive manufacturer warranty.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-10 border-t border-mist pt-8">
              <h3 className="font-display text-xl mb-6">Client Reviews</h3>

              <AnimatePresence>
                {reviewFormOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={submitReview}
                    className="overflow-hidden mb-8 border border-mist p-6"
                  >
                    {!isAuthenticated ? (
                      <p className="text-sm text-onyx/70 mb-4">
                        Please{" "}
                        <Link to="/login" className="text-gold-dark underline underline-offset-4">
                          log in
                        </Link>{" "}
                        to submit a review.
                      </p>
                    ) : (
                      <>
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              aria-label={`Rate ${star} stars`}
                              onClick={() => setReviewRating(star)}
                            >
                              <Star
                                size={20}
                                className={star <= reviewRating ? "text-gold" : "text-onyx/20"}
                                fill={star <= reviewRating ? "currentColor" : "none"}
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Review title (optional)"
                          className="w-full border border-mist px-4 py-3 text-sm mb-3 focus:outline-none focus:border-gold"
                        />
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this piece"
                          rows={4}
                          required
                          className="w-full border border-mist px-4 py-3 text-sm mb-4 focus:outline-none focus:border-gold resize-none"
                        />
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="btn-gold disabled:opacity-60"
                        >
                          {reviewSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>

              {reviews.length === 0 ? (
                <p className="text-sm text-onyx/50">
                  Be the first to review this exquisite piece.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-mist pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={13} className="text-gold" fill="currentColor" />
                        ))}
                        <span className="text-sm font-medium ml-2">{review.user?.name || "Valued Client"}</span>
                      </div>
                      {review.title && (
                        <p className="font-medium text-sm mb-1">{review.title}</p>
                      )}
                      <p className="text-sm text-onyx/70 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="mt-20 md:mt-28"
          >
            <AnimatedRelatedHeading />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
              {related.map((item, index) => (
                <motion.div
                  key={item._id}
                  variants={{
                    hidden: { opacity: 0, y: 28 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: "easeOut" },
                    },
                  }}
                >
                  <ProductCard product={item} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </>
  );
}

function AnimatedRelatedHeading() {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="section-heading text-2xl md:text-3xl text-center"
    >
      You May Also Love
    </motion.h2>
  );
}

// ------------------------------------------------------------------
// Simple color name to hex helper for color swatches
// ------------------------------------------------------------------
function colorToHex(name) {
  const map = {
    Black: "#111111",
    Gold: "#D4AF37",
    Silver: "#C0C0C0",
    "Rose Gold": "#E0BFB8",
    "White Gold": "#F3EFC8",
    Camel: "#C19A6B",
    Ivory: "#FDFBF7",
    Midnight: "#1B1B3A",
    Champagne: "#F7E7CE",
    Blush: "#F5D5C8",
    Graphite: "#4A4A4A",
  };
  return map[name] || "#E5E5E5";
}
