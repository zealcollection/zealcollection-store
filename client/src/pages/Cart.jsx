import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import SEO from "../components/SEO";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../components/ProductCard";
import { imgThumb } from "../lib/imageOpt";

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, cartTotals } = useApp();

  const shippingCost = cartTotals.subtotal >= 500 ? 0 : 25;
  const total = cartTotals.subtotal + shippingCost;

  return (
    <>
      <SEO title="Shopping Cart" description="Review your Zealc.ollection selections before checkout." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-16">
        <h1 className="section-heading text-3xl md:text-5xl text-center mb-3">
          Shopping Cart
        </h1>
        <p className="text-center text-onyx/50 text-sm mb-12">
          {cart.items.length} {cart.items.length === 1 ? "item" : "items"} in your cart
        </p>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-onyx/20 mb-6" />
            <p className="font-display text-2xl mb-3">Your cart is empty</p>
            <p className="text-onyx/60 text-sm mb-8">
              Discover our collection and find something truly extraordinary.
            </p>
            <Link to="/shop" className="btn-gold">
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence initial={false}>
                {cart.items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variant}-${item.color}-${item.photoIndex}-${item.photoLabel}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-5 border border-mist p-4 md:p-6"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      className="w-24 h-32 md:w-28 md:h-36 shrink-0 overflow-hidden bg-mist"
                    >
                          {item.image ? (
                        <img
                          src={imgThumb(item.image)}
                          alt={`${item.name} - ${item.photoLabel || `photo ${item.photoIndex + 1}`}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[9px] tracking-widest uppercase text-center p-2">
                          {item.name}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/product/${item.slug}`}
                            className="font-display text-lg hover:text-gold-dark transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[9px] tracking-[0.18em] uppercase text-onyx/45 mt-2">
                            {[item.photoLabel, item.variant && `Size ${item.variant}`, item.color && `Colour ${item.color}`]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                        </div>
                        <p className="font-display text-lg whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center border border-onyx/25">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.variant,
                                item.color,
                                Math.max(1, item.quantity - 1),
                                item.photoIndex,
                                item.photoLabel
                              )
                            }
                            className="p-2.5 text-onyx hover:text-gold-dark"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.variant,
                                item.color,
                                item.quantity + 1,
                                item.photoIndex,
                                item.photoLabel
                              )
                            }
                            className="p-2.5 text-onyx hover:text-gold-dark"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.productId, item.variant, item.color, item.photoIndex, item.photoLabel)
                          }
                          aria-label={`Remove ${item.name} from cart`}
                          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-onyx/50 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-onyx/60 hover:text-gold-dark transition-colors"
              >
                <ArrowRight size={13} className="rotate-180" /> Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-28 self-start border border-mist p-6 md:p-8 bg-mist/40">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>

              <div className="flex justify-between items-baseline border-t border-mist pt-5 mb-8">
                <span className="font-medium text-[11px] tracking-[0.2em] uppercase text-onyx/60">
                  Total{shippingCost > 0 ? " incl. shipping" : ""}
                </span>
                <span className="font-display text-2xl">{formatPrice(total)}</span>
              </div>

              <Link to="/checkout" className="btn-gold w-full">
                Proceed to Checkout
              </Link>

              <div className="mt-6 flex items-center justify-center gap-6 text-[10px] tracking-[0.15em] uppercase text-onyx/40">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Paystack</span>
                <span>Stripe</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
