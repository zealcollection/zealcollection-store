const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// List all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

module.exports = router;
