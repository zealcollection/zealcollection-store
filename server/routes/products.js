const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");

const router = express.Router();

// Best sellers: highest rated / most sold, ordered by rating then sales
router.get("/best-sellers", async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate("category")
      .sort({ rating: -1, sales: -1 })
      .limit(12);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch best sellers" });
  }
});

// New arrivals: newest products marked as new
router.get("/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find({ isNew: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch new arrivals" });
  }
});

// List products with filters: category, featured, isNew, min/max price, search, ids
router.get("/", async (req, res) => {
  try {
    const { category, categorySlug, featured, isNew, gender, minPrice, maxPrice, search, ids, limit } = req.query;

    const filter = {};

    if (ids) {
      filter._id = { $in: ids.split(",") };
    } else {
      if (category) filter.category = category;
      if (categorySlug) {
        const cat = await Category.findOne({ slug: categorySlug });
        if (cat) filter.category = cat._id;
      }
      if (featured === "true") filter.featured = true;
      if (isNew === "true") filter.isNew = true;
      // Gender audience filter - drives the Men / Ladies sections.
      // "men" | "ladies" matches exactly; "all" includes men, ladies and unisex.
      if (gender) {
        if (gender === "all") {
          filter.gender = { $in: ["men", "ladies", "unisex"] };
        } else {
          filter.gender = gender;
        }
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Single product by slug (explicit route)
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Related products by product id or slug (same category, excluding the product itself)
router.get("/related/:id", async (req, res) => {
  try {
    let product;
    if (/^[0-9a-f]{24}$/i.test(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    if (!product) {
      product = await Product.findOne({ slug: req.params.id });
    }
    if (!product) {
      return res.json({ products: [] });
    }
    const products = await Product.find({ category: product.category, _id: { $ne: product._id } })
      .limit(8)
      .populate("category");
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch related products" });
  }
});

// Single product by slug or id (catch-all, must stay last)
router.get("/:slugOrId", async (req, res) => {
  try {
    let product;
    if (/^[0-9a-f]{24}$/i.test(req.params.slugOrId)) {
      product = await Product.findById(req.params.slugOrId).populate("category");
    }
    if (!product) {
      product = await Product.findOne({ slug: req.params.slugOrId }).populate("category");
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

module.exports = router;
