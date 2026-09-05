import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("token");
  if (stored) {
    config.headers.Authorization = `Bearer ${stored}`;
  }
  return config;
});

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;

// ---------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleLogin: (credential) => api.post("/auth/google", { credential }),
  me: () => api.get("/auth/me"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// ---------------------------------------------------------------
// Products API
// ---------------------------------------------------------------
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getBestSellers: () => api.get("/products/best-sellers"),
  getNewArrivals: () => api.get("/products/new-arrivals"),
  getRelated: (id) => api.get(`/products/related/${id}`),
};

// ---------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
};

// ---------------------------------------------------------------
// Orders API
// ---------------------------------------------------------------
export const ordersAPI = {
  create: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/me"),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (number) => api.get(`/orders/by-number/${number}`),
  // Paystack: open the hosted Paystack checkout for a created order
  initiatePaystack: ({ orderId }) =>
    api.post("/orders/paystack/initiate", { orderId }),
  // Paystack: verify a payment directly with Paystack (never trust the client)
  verifyPaystack: ({ reference, orderId }) =>
    api.post("/orders/paystack/verify", { reference, orderId }),
  // M-Pesa: initiate STK Push
  initiateMpesa: ({ orderId, phoneNumber }) =>
    api.post("/orders/mpesa/stkpush", { orderId, phoneNumber }),
};

// ---------------------------------------------------------------
// Reviews API
// ---------------------------------------------------------------
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post("/reviews", data),
};

// ---------------------------------------------------------------
// Wishlist API
// ---------------------------------------------------------------
export const wishlistAPI = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post("/wishlist/toggle", { productId }),
};

// ---------------------------------------------------------------
// Newsletter API
// ---------------------------------------------------------------
export const newsletterAPI = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
};

// ---------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------
export const adminAPI = {
  // Products
  getProducts: (params) => api.get("/admin/products", { params }),
  createProduct: (data) => api.post("/admin/products", data),
  // Upload image files from the computer. The server saves them locally
  // and returns URL paths - no Cloudinary account needed.
  uploadProductImages: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return api.post("/uploads/product-images", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
  },
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  // Categories
  getCategories: () => api.get("/admin/categories"),
  createCategory: (data) => api.post("/admin/categories", data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  // Orders
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),
  // Customers
  getCustomers: (params) => api.get("/admin/customers", { params }),
  // Reviews
  getReviews: (params) => api.get("/admin/reviews", { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Coupons
  getCoupons: () => api.get("/admin/coupons"),
  createCoupon: (data) => api.post("/admin/coupons", data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  // Newsletter subscribers
  getSubscribers: () => api.get("/admin/newsletter/subscribers"),
  deleteSubscriber: (id) => api.delete(`/admin/newsletter/subscribers/${id}`),
  // Analytics
  getAnalytics: () => api.get("/admin/analytics"),
  // Site settings (CMS)
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};

// ---------------------------------------------------------------
// Public settings (no auth) - hero ribbon words, contact, socials
// ---------------------------------------------------------------
export const settingsAPI = {
  get: () => api.get("/settings"),
};

// ---------------------------------------------------------------
// Users API (profile addresses)
// ---------------------------------------------------------------
export const usersAPI = {
  getAddresses: () => api.get("/users/addresses"),
  addAddress: (data) => api.post("/users/addresses", data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};
