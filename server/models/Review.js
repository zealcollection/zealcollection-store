const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, maxlength: 2000 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update the product's aggregate rating after save
reviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const product = await Product.findById(this.product);
  if (product) await product.updateRating();
});

reviewSchema.post("deleteOne", { document: true, query: true }, async function () {
  const doc = this.document || (await this.model.findOne(this.getFilter()));
  if (doc) {
    const Product = mongoose.model("Product");
    const product = await Product.findById(doc.product);
    if (product) await product.updateRating();
  }
});

module.exports = mongoose.model("Review", reviewSchema);
