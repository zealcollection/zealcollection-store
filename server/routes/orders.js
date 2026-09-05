const mongoose = require("mongoose");
const crypto = require("crypto");
const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { protect, optionalAuth } = require("../middleware/auth");
const { calculateShippingCost } = require("../utils/shipping");
const { sendOrderConfirmation } = require("../utils/email");
const { initiateSTKPush } = require("../utils/mpesa");

const router = express.Router();

// ------------------------------------------------------------------
// PAYSTACK HELPERS
// The Paystack SDK is loaded lazily so the route file still boots if
// the PAYSTACK_SECRET_KEY environment variable is missing - only the
// Paystack-specific endpoints will fail, not the whole server.
// ------------------------------------------------------------------
function getPaystackClient() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return null;
  try {
    return require("paystack")(key);
  } catch {
    return null;
  }
}

// Paystack expects amounts in the currency's smallest unit.
// For KES, 1 shilling = 100 cents, so KSh 46 is sent as 4600.
const PAYSTACK_CURRENCY = (process.env.PAYSTACK_CURRENCY || "KES").toUpperCase();
const PAYSTACK_SUBUNIT = 100;

// ------------------------------------------------------------------
// Create an order (guest or authenticated)
// ------------------------------------------------------------------
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, paymentMethod, couponCode, notes } = req.body;

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Please provide at least one item" });
    }

    // Frontend compatibility: accept `shipping` (current shape) or the older
    // `shippingAddress` object (flat firstName/lastName/street/...) and
    // normalize everything into a single `shipping` record.
    let rawShipping = req.body.shipping || req.body.shippingAddress;
    let shipping = null;
    if (rawShipping) {
      const name =
        rawShipping.name ||
        `${rawShipping.firstName || ""} ${rawShipping.lastName || ""}`.trim();
      shipping = {
        name,
        street: rawShipping.street || rawShipping.address || "",
        city: rawShipping.city || "",
        state: rawShipping.state || "",
        zipCode: rawShipping.zipCode || "",
        country: rawShipping.country || "",
        email: rawShipping.email || "",
        phone: rawShipping.phone || "",
      };
    }

    const { name: shipName, street, city, state, zipCode, country } = shipping || {};
    if (!shipName || !street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: "Please provide complete shipping details" });
    }

    // Resolve products and compute subtotal.
    // Stock validation is intentionally a READ ONLY here - the authoritative
    // check happens in the atomic block below. Reading first lets us fail
    // fast on products that do not exist and price out the order.
    let subtotal = 0;
    const resolvedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      subtotal += product.price * item.quantity;
      resolvedItems.push({
        product: product._id,
        name: product.name,
        // Keep the exact photo the shopper selected on the card (passed from
        // the cart); only fall back to the product's first image when missing.
        image: item.image || (product.images && product.images[0]) || "",
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        color: item.color,
        photoLabel: item.photoLabel || undefined,
      });
    }

    // ------------------------------------------------------------------
    // ATOMIC STOCK RESERVATION
    // Guards against race conditions: if two clients try to buy the last
    // unit at the same time, only the first request wins. Each item is
    // claimed with a single atomic query that decrements stock ONLY if
    // enough stock exists at that exact moment. If any item fails, every
    // reservation made so far is rolled back and the order is rejected.
    // ------------------------------------------------------------------
    const decrements = [];
    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: qty } },
        { $inc: { stock: -qty, soldCount: qty } },
        { new: true }
      );
      if (!updated) {
        // Roll back every decrement already applied in this request
        for (const d of decrements) {
          await Product.findByIdAndUpdate(d.product, {
            $inc: { stock: d.quantity, soldCount: -d.quantity },
          });
        }
        const currentStock = await Product.findById(item.product).select("stock name");
        return res.status(409).json({
          message:
            currentStock && currentStock.stock === 0
              ? `Sorry, ${currentStock.name || "this item"} is now sold out`
              : `Not enough stock for ${currentStock?.name || "this item"}. Only ${currentStock?.stock ?? 0} left`,
          soldOut: currentStock ? currentStock.stock === 0 : true,
        });
      }
      decrements.push({ product: item.product, quantity: qty });
    }

    // Apply coupon
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        active: true,
      });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }
      if (subtotal < coupon.minOrder) {
        return res
          .status(400)
          .json({
            message: `This coupon requires a minimum order of $${coupon.minOrder}`,
          });
      }
      if (coupon.type === "percentage") {
        discount = Math.round((subtotal * coupon.discount) / 100);
      } else {
        discount = coupon.discount;
      }
      appliedCoupon = coupon.code;
    }

    // Determine shipping method and cost from payment method
    const shippingMethod = paymentMethod === "cod" ? "cod" : req.body.shippingMethod || "standard";
    const shippingCost = calculateShippingCost({
      method: shippingMethod,
      subtotal,
    });

    const total = Math.max(0, subtotal - discount + shippingCost);

    const order = await Order.create({
      user: req.user ? req.user._id : undefined,
      items: resolvedItems,
      shipping: { ...shipping, email: shipping.email },
      subtotal,
      shippingCost,
      discount,
      total,
      coupon: appliedCoupon,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      notes,
    });

    // Stock was already decremented atomically above - nothing to do here.

    res.status(201).json({
      order,
      message:
        paymentMethod === "cod"
          ? "Order placed - pay on delivery"
          : "Order placed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// ------------------------------------------------------------------
// PAYSTACK: Initialize a payment session (KES, Kenya)
// Called by the frontend right after the order is created, so the shopper
// can be sent to the Paystack-hosted checkout for the new order.
// ------------------------------------------------------------------
router.post("/paystack/initiate", optionalAuth, async (req, res) => {
  try {
    const Paystack = getPaystackClient();
    if (!Paystack) {
      return res.status(503).json({ message: "Paystack is not configured" });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus === "paid") {
      return res.json({ authorizationUrl: null, message: "Already paid" });
    }

    const callbackUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/order-confirmation/${order._id}`;

    const paystackAmount = Math.round(order.total * PAYSTACK_SUBUNIT);
    console.log(
      `[Paystack] Order ${order.orderNumber} total=${order.total} subtotal=${order.subtotal} shipping=${order.shippingCost} discount=${order.discount} items=${order.items
        .map((i) => `${i.name}(price=${i.price}x${i.quantity})`)
        .join(", ")} -> amount sent to Paystack: ${paystackAmount} ${PAYSTACK_CURRENCY}`
    );

    const session = await Paystack.transaction.initialize({
      email: order.shipping.email || (req.user && req.user.email),
      amount: paystackAmount, // smallest currency unit: KES cents (KSh 46 -> 4600)
      currency: PAYSTACK_CURRENCY,
      reference: order.orderNumber,
      callback_url: callbackUrl,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: req.user ? req.user._id.toString() : undefined,
      },
    });

    if (!session || session.status === false) {
      return res.status(503).json({
        message:
          (session && session.message) || "Payment service is unavailable",
      });
    }

    order.paymentReference = session.data.reference;
    await order.save({ validateBeforeSave: false });

    res.json({ authorizationUrl: session.data.authorization_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// ------------------------------------------------------------------
// PAYSTACK: Verify a payment (called by the frontend on return to the
// confirmation page). Verifies directly with Paystack, never trusting
// the client, then marks the order paid and sends the confirmation email.
// ------------------------------------------------------------------
router.post("/paystack/verify", optionalAuth, async (req, res) => {
  try {
    const Paystack = getPaystackClient();
    if (!Paystack) {
      return res.status(503).json({ message: "Paystack is not configured" });
    }

    const { reference, orderId } = req.body;
    if (!reference && !orderId) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    let order = null;
    if (orderId) order = await Order.findById(orderId);
    if (!order && reference) order = await Order.findOne({ paymentReference: reference });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus === "paid") {
      return res.json({ order, verified: true });
    }

    // Always verify with Paystack directly - never trust the client.
    const ref = reference || order.paymentReference;
    if (!ref) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const result = await Paystack.transaction.verify(ref);

    if (!result || result.status === false) {
      return res.status(503).json({
        message:
          (result && result.message) || "Payment service is unavailable",
      });
    }

    if (result.data.status === "success") {
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      order.paymentReference = ref;
      await order.save({ validateBeforeSave: false });

      const emailForConfirmation = order.shipping.email || (order.user && order.user.email);
      if (emailForConfirmation) {
        await sendOrderConfirmation(order, emailForConfirmation).catch(() => {});
      }

      return res.json({ order, verified: true });
    }

    order.paymentStatus = "failed";
    await order.save({ validateBeforeSave: false });
    return res.json({ order, verified: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// ------------------------------------------------------------------
// PAYSTACK: Webhook to confirm payment automatically.
// Paystack POSTs here when a transaction completes. The payload arrives
// as raw JSON so the HMAC-SHA512 signature can be validated; the route
// is mounted manually in server.js to skip the global JSON parser.
// ------------------------------------------------------------------
const paystackWebhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!signature) {
      return res.status(401).json({ message: "Missing webhook signature" });
    }
    if (!process.env.PAYSTACK_SECRET_KEY) {
      // Paystack is not configured on this server - refuse to accept webhooks
      return res.status(503).json({ message: "Paystack is not configured" });
    }

    const expected = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body.toString())
      .digest("hex");

    if (signature !== expected) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    let event;
    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ message: "Malformed webhook payload" });
    }

    // Only charge.success matters for payment confirmation. Respond 200
    // immediately for other events to keep Paystack's retry window quiet.
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data || {};
    const order =
      (await Order.findOne({ paymentReference: data.reference })) ||
      (await Order.findOne({ orderNumber: data.orderNumber }));

    if (order && order.paymentStatus !== "paid" && data.status === "success") {
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      order.paymentReference = data.reference;
      await order.save({ validateBeforeSave: false });

      const emailForConfirmation = order.shipping.email || (order.user && order.user.email);
      if (emailForConfirmation) {
        await sendOrderConfirmation(order, emailForConfirmation).catch(() => {});
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

// Mount the webhook with raw body parsing (needed for HMAC verification),
// skipping the global express.json middleware.
router.post("/paystack/webhook", express.raw({ type: "application/json" }), paystackWebhookHandler);

// Get my orders (authenticated users)
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Alias used by the frontend client (ordersAPI.getMyOrders -> /orders/me)
router.get("/me", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get a single order by id - PUBLIC route used by the order confirmation
// page. Anyone holding the order _id (or order number) can view it, because
// the confirmation URL itself is the proof of entitlement. When a logged-in
// user views an order, ownership is still enforced so accounts cannot be
// used to read other customers' orders.
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    let order = null;

    // Accept either a MongoDB _id or the human-readable order number,
    // so the confirmation page always finds the order regardless of
    // which identifier the browser is holding.
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: req.params.id });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Logged-in users may only view their own orders (admins see all).
    // Anonymous guests may view any order they hold the URL for.
    if (req.user && req.user.role !== "admin") {
      if (!order.user || !order.user._id.equals(req.user._id)) {
        return res
          .status(403)
          .json({ message: "This order does not belong to you" });
      }
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Guest lookup by order number (used by the public order confirmation
// page). Accepts the human-readable order number OR the MongoDB _id so
// the fallback path in the confirmation page always resolves.
router.get("/by-number/:number", async (req, res) => {
  try {
    let order = await Order.findOne({ orderNumber: req.params.number });
    if (!order && mongoose.Types.ObjectId.isValid(req.params.number)) {
      order = await Order.findById(req.params.number);
    }
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// ------------------------------------------------------------------
// STRIPE: Create a Checkout Session
// ------------------------------------------------------------------
router.post("/stripe/create-session", optionalAuth, async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus === "paid") {
      return res.json({ url: null, message: "Already paid" });
    }

    const successUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/order-confirmation/${order._id}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/checkout`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId: order._id.toString() },
    });

    order.paymentReference = session.id;
    await order.save({ validateBeforeSave: false });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Stripe session creation failed" });
  }
});

// ------------------------------------------------------------------
// STRIPE: Webhook to confirm payment
// ------------------------------------------------------------------
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Webhook signature invalid" });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const order = await Order.findById(session.metadata.orderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.orderStatus = "processing";
        await order.save({ validateBeforeSave: false });

        const emailForConfirmation = order.shipping.email || (order.user && order.user.email);
        if (emailForConfirmation) {
          await sendOrderConfirmation(order, emailForConfirmation).catch(() => {});
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// ------------------------------------------------------------------
// M-PESA: Initialize STK Push (Lipa Na M-Pesa Online)
// ------------------------------------------------------------------
router.post("/mpesa/stkpush", optionalAuth, async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;
    if (!orderId || !phoneNumber) {
      return res.status(400).json({ message: "Order ID and phone number are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.paymentStatus === "paid") {
      return res.json({ message: "Already paid" });
    }

    // Safaricom callback URL - must be public for Daraja to reach it
    const callbackUrl = `${process.env.API_URL || "https://api.zealcollection.com"}/api/orders/mpesa/callback`;

    console.log(`[M-Pesa] Initiating STK Push for Order ${order.orderNumber}, Phone: ${phoneNumber}, Amount: ${order.total}`);

    const result = await initiateSTKPush({
      phoneNumber,
      amount: order.total,
      orderNumber: order.orderNumber,
      callbackUrl,
    });

    // Save the CheckoutRequestID to track this payment attempt
    order.paymentReference = result.CheckoutRequestID;
    await order.save({ validateBeforeSave: false });

    res.json({
      message: "STK Push initiated successfully. Please check your phone to complete payment.",
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (error) {
    console.error("[M-Pesa] STK Push Initiation Failed:", error.message);
    res.status(500).json({ message: error.message || "Failed to initiate M-Pesa payment" });
  }
});

// ------------------------------------------------------------------
// M-PESA: Callback handler (Webhook from Safaricom)
// ------------------------------------------------------------------
router.post("/mpesa/callback", async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    console.log(`[M-Pesa] Callback received for CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}`);

    const order = await Order.findOne({ paymentReference: CheckoutRequestID });
    if (!order) {
      console.warn(`[M-Pesa] Order not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.sendStatus(200); // Always respond 200 to Safaricom
    }

    if (ResultCode === 0) {
      // Success! Extract metadata (Receipt Number, Amount, Date)
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      console.log(`[M-Pesa] Payment SUCCESS for Order ${order.orderNumber}. Receipt: ${metadata.MpesaReceiptNumber}`);

      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      order.notes = `${order.notes || ""}\nM-Pesa Receipt: ${metadata.MpesaReceiptNumber}`.trim();
      await order.save({ validateBeforeSave: false });

      const emailForConfirmation = order.shipping.email || (order.user && order.user.email);
      if (emailForConfirmation) {
        await sendOrderConfirmation(order, emailForConfirmation).catch(() => {});
      }
    } else {
      console.warn(`[M-Pesa] Payment FAILED for Order ${order.orderNumber}. Reason: ${ResultDesc}`);
      order.paymentStatus = "failed";
      order.notes = `${order.notes || ""}\nM-Pesa Failed: ${ResultDesc}`.trim();
      await order.save({ validateBeforeSave: false });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[M-Pesa] Callback Error:", error.message);
    res.sendStatus(500);
  }
});

module.exports = router;
