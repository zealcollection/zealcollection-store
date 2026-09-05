// ------------------------------------------------------------------
// Wishlist routes - GET /api/wishlist and POST /api/wishlist/toggle
// The wishlist is stored as an array of product ids on the logged-in
// user. Toggling a product that is already saved removes it; otherwise
// it is added. Guests are redirected to log in.
// ------------------------------------------------------------------
const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Get the current user's wishlist product ids
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wishlist");
    res.json({ wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ message: "Could not load the wishlist" });
  }
});

// Add or remove a product from the wishlist
router.post("/toggle", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Please provide a product" });
    }
    // Only allow existing, visible products
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const user = await User.findById(req.user.id);
    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({
      message: index > -1 ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
      isSaved: index === -1,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not update the wishlist" });
  }
});

module.exports = router;
