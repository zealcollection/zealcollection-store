import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { authAPI, wishlistAPI } from "../lib/api";

const AppContext = createContext(null);

// ---------------------------------------------------------------
// Auth reducer
// ---------------------------------------------------------------
const authInitialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "SET_AUTH":
      return { ...state, user: action.payload, loading: false };
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "LOGOUT":
      return { user: null, token: null, loading: false };
    case "AUTH_ERROR":
      return { ...state, user: null, token: null, loading: false };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Cart reducer
// ---------------------------------------------------------------
// A stable identity key so add / update / remove all target the exact
// same cart line (same product, size, colour AND photo). Treating old
// items without photo fields (photoIndex undefined) as the default
// "first photo" line keeps the guest carts from previous visits valid.
function cartItemKey(item) {
  return [
    item.productId ?? "",
    item.variant ?? "",
    item.color ?? "",
    item.photoIndex ?? 0,
    item.photoLabel ?? "",
  ].join("|");
}

function isSameCartItem(item, payload) {
  return cartItemKey(item) === cartItemKey(payload);
}
const cartInitialState = {
  items: JSON.parse(localStorage.getItem("cart") || "[]"),
};

function cartReducer(state, action) {
  let updated;
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingIndex = state.items.findIndex((item) =>
        isSameCartItem(item, action.payload)
      );
      if (existingIndex >= 0) {
        updated = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updated = [...state.items, action.payload];
      }
      localStorage.setItem("cart", JSON.stringify(updated));
      return { ...state, items: updated };
    }
    case "UPDATE_QUANTITY": {
      updated = state.items.map((item) =>
        isSameCartItem(item, action.payload)
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      return { ...state, items: updated };
    }
    case "REMOVE_FROM_CART": {
      updated = state.items.filter(
        (item) => !isSameCartItem(item, action.payload)
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      return { ...state, items: updated };
    }
    case "CLEAR_CART": {
      localStorage.removeItem("cart");
      return { ...state, items: [] };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Wishlist reducer (persists guest wishlist in localStorage)
// ---------------------------------------------------------------
const wishlistInitialState = {
  items: JSON.parse(localStorage.getItem("wishlist") || "[]"),
  synced: false,
};

function wishlistReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_LOCAL": {
      const exists = state.items.some(
        (id) => id === action.payload
      );
      const updated = exists
        ? state.items.filter((id) => id !== action.payload)
        : [...state.items, action.payload];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return { ...state, items: updated };
    }
    case "SET_WISHLIST":
      return { ...state, items: action.payload, synced: true };
    default:
      return state;
  }
}

// ---------------------------------------------------------------
// Provider
// ---------------------------------------------------------------
export function AppProvider({ children }) {
  const [auth, dispatchAuth] = useReducer(authReducer, authInitialState);
  const [cart, dispatchCart] = useReducer(cartReducer, cartInitialState);
  const [wishlistState, dispatchWishlist] = useReducer(
    wishlistReducer,
    wishlistInitialState
  );
  const [searchQuery, setSearchQuery] = useState("");

  const isAuthenticated = Boolean(auth.token);
  const isAdmin = auth.user?.role === "admin";

  // Restore authenticated user on mount
  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const { data } = await authAPI.me();
        if (!cancelled) dispatchAuth({ type: "SET_AUTH", payload: data.user });
      } catch {
        if (!cancelled) dispatchAuth({ type: "AUTH_ERROR" });
      }
    }
    if (auth.token) loadUser();
    else dispatchAuth({ type: "AUTH_ERROR" });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  // Sync guest wishlist to server after login
  useEffect(() => {
    let cancelled = false;
    async function syncWishlist() {
      if (!isAuthenticated || wishlistState.synced) return;
      try {
        const local = wishlistState.items;
        if (local.length === 0) {
          const { data } = await wishlistAPI.get();
          if (!cancelled)
            dispatchWishlist({ type: "SET_WISHLIST", payload: data.wishlist });
          return;
        }
        for (const productId of local) {
          try {
            await wishlistAPI.toggle(productId);
          } catch {
            // Continue syncing remaining items
          }
        }
        const { data } = await wishlistAPI.get();
        if (!cancelled)
          dispatchWishlist({ type: "SET_WISHLIST", payload: data.wishlist });
      } catch {
        // Silently fail sync; user can retry
      }
    }
    syncWishlist();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, wishlistState.synced, wishlistState.items]);

  // Cart helpers
  const addToCart = (product, quantity, variant, color, photo) => {
    dispatchCart({
      type: "ADD_TO_CART",
      payload: {
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        // The exact photo the shopper was looking at - keeps the cart line
        // item tied to the specific bag/item selected on the card.
        image: photo?.photoUrl || product.images?.[0] || "",
        photoIndex: photo?.photoIndex ?? 0,
        photoLabel: photo?.photoLabel || "",
        variant,
        color,
        quantity,
      },
    });
    toast.success(
      photo?.photoLabel
        ? `"${photo.photoLabel}" added to cart`
        : `${product.name} added to cart`
    );
  };

  const updateCartQuantity = (productId, variant, color, quantity, photoIndex, photoLabel) => {
    dispatchCart({
      type: "UPDATE_QUANTITY",
      payload: { productId, variant, color, quantity, photoIndex: photoIndex ?? 0, photoLabel: photoLabel || "" },
    });
  };
  const removeFromCart = (productId, variant, color, photoIndex, photoLabel) => {
    dispatchCart({
      type: "REMOVE_FROM_CART",
      payload: { productId, variant, color, photoIndex: photoIndex ?? 0, photoLabel: photoLabel || "" },
    });
    toast.success("Item removed from cart");
  };

  const clearCart = () => dispatchCart({ type: "CLEAR_CART" });

  const cartTotals = useMemo(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return { subtotal, itemCount };
  }, [cart.items]);

  // Wishlist helpers
  const toggleWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const { data } = await wishlistAPI.toggle(productId);
        dispatchWishlist({ type: "SET_WISHLIST", payload: data.wishlist });
        toast.success(
          data.message ||
            (wishlistState.items.includes(productId)
              ? "Removed from wishlist"
              : "Added to wishlist")
        );
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      dispatchWishlist({ type: "TOGGLE_LOCAL", payload: productId });
      const nowIn = wishlistState.items.includes(productId);
      toast.success(nowIn ? "Removed from wishlist" : "Added to wishlist");
    }
  };

  // Auth helpers
  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    dispatchAuth({ type: "LOGIN", payload: { user: data.user, token: data.token } });
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem("token", data.token);
    dispatchAuth({ type: "LOGIN", payload: { user: data.user, token: data.token } });
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatchAuth({ type: "LOGOUT" });
    dispatchWishlist({ type: "SET_WISHLIST", payload: [] });
    localStorage.removeItem("wishlist");
    dispatchCart({ type: "CLEAR_CART" });
    toast.success("You have been logged out");
  };

  const updateProfile = async (payload) => {
    const { data } = await authAPI.updateProfile(payload);
    dispatchAuth({ type: "UPDATE_USER", payload: data.user });
    toast.success("Profile updated successfully");
    return data.user;
  };

  const value = {
    auth,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
    wishlistState,
    toggleWishlist,
    searchQuery,
    setSearchQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export default AppContext;
