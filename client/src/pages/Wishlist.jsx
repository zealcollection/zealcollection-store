import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";

import SEO from "../components/SEO";
import { useApp } from "../context/AppContext";
import { productsAPI } from "../lib/api";
import { DEMO_PRODUCTS } from "../data/demoData";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlistState, toggleWishlist, addToCart, isAuthenticated } = useApp();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (wishlistState.items.length === 0) {
          setLoading(false);
          return;
        }
        if (isAuthenticated) {
          const { data } = await productsAPI.getAll({ ids: wishlistState.items.join(",") });
          if (!cancelled) setWishlistProducts(data.products || []);
        } else {
          const matched = DEMO_PRODUCTS.filter((p) =>
            wishlistState.items.includes(p._id)
          );
          if (!cancelled) setWishlistProducts(matched);
        }
      } catch {
        const matched = DEMO_PRODUCTS.filter((p) =>
          wishlistState.items.includes(p._id)
        );
        if (!cancelled) setWishlistProducts(matched);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [wishlistState.items, isAuthenticated]);

  return (
    <>
      <SEO title="Wishlist" description="Your saved Zealc.ollection selections." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-16">
        <div className="text-center mb-12">
          <h1 className="section-heading text-3xl md:text-5xl mb-3">My Wishlist</h1>
          <p className="text-onyx/50 text-sm">
            {wishlistState.items.length} {wishlistState.items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {wishlistState.items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-onyx/20 mb-6" />
            <p className="font-display text-2xl mb-3">Your wishlist is empty</p>
            <p className="text-onyx/60 text-sm mb-8">
              Save the pieces you adore and return to them anytime.
            </p>
            <Link to="/shop" className="btn-gold">
              Explore the Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index % 4} />
            ))}
          </div>
        )}

        {wishlistState.items.length > 0 && wishlistProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl mb-3">Saved items are loading</p>
            <p className="text-onyx/60 text-sm">
              Sign in to keep your wishlist synchronized across all your devices.
            </p>
            {!isAuthenticated && (
              <Link to="/login" className="btn-luxury mt-6">
                Log In
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
