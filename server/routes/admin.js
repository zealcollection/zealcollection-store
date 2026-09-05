const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");
const Coupon = require("../models/Coupon");
const Subscriber = require("../models/Subscriber");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// ------------------------------------------------------------------
// Analytics overview
// ------------------------------------------------------------------
router.get("/analytics", async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const revenueByMonth = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    res.json({
      analytics: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: await Order.countDocuments(),
        totalCustomers: await User.countDocuments(),
        totalProducts: await Product.countDocuments(),
        maxMonthlyRevenue:
          revenueByMonth.length > 0
            ? Math.max(...revenueByMonth.map((r) => r.revenue))
            : 1,
        revenueByMonth: revenueByMonth.map((r) => ({
          month: r._id,
          revenue: r.revenue,
          orders: r.orders,
        })),
        ordersByStatus: ordersByStatus.map((r) => ({
          status: r._id || "pending",
          count: r.count,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

// ------------------------------------------------------------------
// Products
// ------------------------------------------------------------------
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category").sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      cardDescription,
      price,
      stock,
      category,
      variants,
      colors,
      images,
      photoLabels,
      colorImages,
      featured,
      isNew,
      comingSoon,
      gender,
    } = req.body;

    if (!name || !description || price === undefined || !category || !images || images.length === 0) {
      return res.status(400).json({ message: "Please provide name, description, price, category and at least one image" });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      category,
      variants: variants || [],
      colors: colors || [],
      images,
      photoLabels: photoLabels || [],
      colorImages: colorImages || [],
      cardDescription: typeof cardDescription === "string" ? cardDescription : undefined,
      featured: featured || false,
      isNew: isNew || false,
      comingSoon: comingSoon || false,
      gender: gender || "unisex",
    });

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ------------------------------------------------------------------
// Categories
// ------------------------------------------------------------------
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, slug, image, images, gender } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Please provide name and slug" });
    }
    const category = await Category.create({
      name,
      slug,
      image,
      images: images || [],
      gender: gender || "unisex",
    });
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const { name, slug, image, images, gender } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, image, images, gender: gender || "unisex" },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

// ------------------------------------------------------------------
// Orders
// ------------------------------------------------------------------
router.get("/orders", async (req, res) => {
  try {
    const { status, payment } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (payment) filter.paymentStatus = payment;
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order" });
  }
});

// ------------------------------------------------------------------
// Customers
// ------------------------------------------------------------------
router.get("/customers", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -addresses -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Promote/demote user role
router.put("/customers/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// ------------------------------------------------------------------
// Reviews
// ------------------------------------------------------------------
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

// ------------------------------------------------------------------
// Coupons
// ------------------------------------------------------------------
router.get("/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    const { code, discount, type, minOrder } = req.body;
    if (!code || discount === undefined || !type) {
      return res.status(400).json({ message: "Please provide code, discount and type" });
    }
    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discount: Number(discount),
      type,
      minOrder: Number(minOrder) || 0,
    });
    res.status(201).json({ coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon" });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

// ------------------------------------------------------------------
// Newsletter subscribers
// ------------------------------------------------------------------
router.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

router.delete("/subscribers/:id", async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    res.json({ message: "Subscriber removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove subscriber" });
  }
});

// ------------------------------------------------------------------
// Site settings (CMS) - marquee words, contact info, social links
// ------------------------------------------------------------------
router.get("/settings", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    const body = req.body || {};
    const payload = {};
    if (Array.isArray(body.marqueeWords)) payload.marqueeWords = body.marqueeWords.map((w) => String(w).trim()).filter(Boolean);
    if (typeof body.contactEmail === "string") payload.contactEmail = body.contactEmail.trim();
    if (typeof body.instagramUrl === "string") payload.instagramUrl = body.instagramUrl.trim();
    if (typeof body.instagramHandle === "string") payload.instagramHandle = body.instagramHandle.trim().replace(/^@/, "");
    if (typeof body.announcement === "string") payload.announcement = body.announcement.trim();
    if (typeof body.brandName === "string") payload.brandName = body.brandName.trim();
    if (typeof body.heroSubtitle === "string") payload.heroSubtitle = body.heroSubtitle.trim();
    // Hero slideshow slides: full array replaces the previous slides
    if (Array.isArray(body.heroSlides)) {
      payload.heroSlides = body.heroSlides
        .map((s) => ({
          eyebrow: typeof s.eyebrow === "string" ? s.eyebrow.trim() : "",
          headline: typeof s.headline === "string" ? s.headline.trim() : "",
          description: typeof s.description === "string" ? s.description.trim() : "",
          cta: typeof s.cta === "string" ? s.cta.trim() : "",
          ctaHref: typeof s.ctaHref === "string" ? s.ctaHref.trim() : "",
          bg: typeof s.bg === "string" ? s.bg.trim() : "",
        }))
        .filter((s) => s.eyebrow || s.headline || s.description || s.cta || s.ctaHref || s.bg);
    }
    // About page content
    if (typeof body.aboutStoryTitle === "string") payload.aboutStoryTitle = body.aboutStoryTitle.trim();
    if (typeof body.aboutStoryIntro === "string") payload.aboutStoryIntro = body.aboutStoryIntro.trim();
    if (typeof body.aboutStoryBody === "string") payload.aboutStoryBody = body.aboutStoryBody.trim();
    if (typeof body.aboutStoryClosing === "string") payload.aboutStoryClosing = body.aboutStoryClosing.trim();
    if (typeof body.aboutAtelierTitle === "string") payload.aboutAtelierTitle = body.aboutAtelierTitle.trim();
    if (typeof body.aboutHeroSubtitle === "string") payload.aboutHeroSubtitle = body.aboutHeroSubtitle.trim();
    // Bestsellers slideshow backdrop images (one per featured product, in order)
    if (Array.isArray(body.bestSellersImages)) {
      payload.bestSellersImages = body.bestSellersImages.map((u) => String(u).trim()).filter(Boolean);
    }
    if (Array.isArray(body.aboutValues)) {
      payload.aboutValues = body.aboutValues
        .map((v) => ({
          title: typeof v.title === "string" ? v.title.trim() : "",
          text: typeof v.text === "string" ? v.text.trim() : "",
        }))
        .filter((v) => v.title || v.text);
    }
    let settings = await Setting.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true });
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

module.exports = router;

// ------------------------------------------------------------------
// Newsletter subscribers (admin Newsletter tab). These sit under
// /api/admin so the admin middleware above already protects them.
// ------------------------------------------------------------------
router.get("/newsletter/subscribers", async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select("email createdAt")
      .sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (error) {
    res.status(500).json({ message: "Could not load subscribers" });
  }
});

router.delete("/newsletter/subscribers/:id", async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscriber removed" });
  } catch (error) {
    res.status(500).json({ message: "Could not remove subscriber" });
  }
});
