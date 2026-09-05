const express = require("express");
const Review = require("../models/Review");
const { protect } = require("../middleware/auth");

const router = express.Router();

// List reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      approved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Submit a review (authenticated only)
router.post("/", protect, async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;

    if (!product || !rating || !comment) {
      return res
        .status(400)
        .json({ message: "Please provide product, rating and comment" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existing = await Review.findOne({
      user: req.user._id,
      product,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      title,
      comment,
    });

    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review" });
  }
});

module.exports = router;
