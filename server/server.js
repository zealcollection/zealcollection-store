// ------------------------------------------------------------------
// Zealc.ollection Backend Server
// Entry point - registers routes, middleware and starts listening.
// ------------------------------------------------------------------
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const newsletterRoutes = require("./routes/newsletter");
const settingsRoutes = require("./routes/settings");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/uploads");
const wishlistRoutes = require("./routes/wishlist");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------------------------------------
// Connect to MongoDB
// ------------------------------------------------------------------
connectDB();

// ------------------------------------------------------------------
// Middleware
// ------------------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_URL || "https://zealcollection-store-1.onrender.com", credentials: true }));

// Paystack webhooks arrive as raw JSON and must bypass the global parser so
// the HMAC-SHA512 signature can be validated against the raw request body.
// IMPORTANT: this is registered BEFORE express.json() - once the JSON parser
// consumes the body stream, the raw handler can no longer see the bytes.
app.use(
  "/api/orders/paystack/webhook",
  express.raw({ type: "application/json", limit: "5mb" })
);
// M-Pesa callbacks also arrive as JSON; raw parsing is not strictly required
// for validation yet but we register it here for future HMAC support.
app.use(
  "/api/orders/mpesa/callback",
  express.raw({ type: "application/json", limit: "5mb" })
);
app.use(express.json({ limit: "5mb" }));

// Security: limit repeated requests to authentication endpoints.
// The payment init and webhook endpoints deliberately sit outside the
// auth limiter so Paystack's automatic retries can reach the webhook.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { message: "Too many requests, please try again later" },
});
app.use("/api/auth", authLimiter);

// Strict limiter for the Paystack payment initiation endpoint only
// (10 requests per 15 minutes) to stop rapid order-creation abuse.
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many payment attempts, please try again later" },
});
app.use("/api/orders/paystack/initiate", paymentLimiter);
app.use("/api/orders/mpesa/stkpush", paymentLimiter);

// ------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
// Serve locally uploaded product images at /uploads/products/<file>.
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "1y" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", store: "Zealc.ollection" });
});

// ------------------------------------------------------------------
// Start
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Zealc.ollection server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
