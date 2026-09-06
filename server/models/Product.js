const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: "" },
    // Short elegant blurb shown on product cards and the Bestsellers section.
    // Edit it in the admin Products form ("Card Blurb" field). Falls back to
    // the first ~120 characters of the full description when empty.
    cardDescription: { type: String },
    price: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Comma-free arrays of option names, e.g. ["40mm", "42mm"]
    variants: [{ type: String, trim: true }],
    // Option color/material names, e.g. ["Gold", "Silver"]
    colors: [{ type: String, trim: true }],
    // CLOUDINARY image URLs - paste your uploaded image URLs here
    images: [{ type: String }],
    // Optional per-photo labels: when one card holds several items (e.g.
    // different bags of the same line), label each photo so the shopper
    // adds exactly the item they selected, e.g. ["Monaco", "Savoy"].
    // An empty entry keeps that photo unnamed (generic gallery photo).
    photoLabels: [{ type: String, trim: true }],
    // Per-colour images - selecting a colour swatch shows its matching photo.
    // Each entry: { color: "Noir", image: "https://..." }
    colorImages: [
      {
        color: { type: String, trim: true },
        image: { type: String },
      },
    ],
    // Shopper audience - drives the Men / Ladies sections
    gender: { type: String, enum: ["men", "ladies", "unisex"], default: "unisex" },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    // Coming Soon - pairs with New Arrival: announced but not yet purchasable
    comingSoon: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Update aggregate rating whenever reviews change
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    this.rating = Math.round(stats[0].avgRating * 10) / 10;
    this.numReviews = stats[0].count;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model("Product", productSchema);
