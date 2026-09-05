const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    minOrder: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
