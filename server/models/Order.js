const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    variant: String,
    color: String,
    // Name of the specific photo/item the shopper selected on the card
    photoLabel: String,
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: String,
    phone: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shipping: { type: shippingSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: { type: String, trim: true, uppercase: true },
    paymentMethod: {
      type: String,
      enum: ["paystack", "mpesa", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: String,
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    notes: String,
  },
  { timestamps: true }
);

// Generate a human-friendly order number before saving
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear().toString().slice(-2);
    const firstName = String(this.shipping?.name || "Guest")
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 16)
      .toUpperCase() || "GUEST";
    this.orderNumber = `ZC-${year}-${firstName}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
