const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    // CLOUDINARY image URL - paste your uploaded category image URL here
    image: String,
    // Optional slideshow images - the card crossfades between `image` and these
    images: [String],
    // Section assignment - controls which storefront section shows this
    // category card: Men, Ladies, or Unisex.
    gender: { type: String, enum: ["men", "ladies", "unisex"], default: "unisex" },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
