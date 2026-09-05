import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { ShoppingBag, Truck } from "lucide-react";

import SEO from "../components/SEO";
import { useApp } from "../context/AppContext";
import { ordersAPI } from "../lib/api";
import { formatPrice } from "../components/ProductCard";
import { imgThumb } from "../lib/imageOpt";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["paystack", "mpesa", "cod"]),
  couponCode: z.string().optional(),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotals, clearCart, isAuthenticated, auth } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: auth.user?.name?.split(" ")[0] || "",
      lastName: auth.user?.name?.split(" ").slice(1).join(" ") || "",
      email: auth.user?.email || "",
      phone: auth.user?.phone || "",
      address: auth.user?.addresses?.[0]?.street || "",
      city: auth.user?.addresses?.[0]?.city || "",
      state: auth.user?.addresses?.[0]?.state || "",
      zipCode: auth.user?.addresses?.[0]?.zipCode || "",
      country: auth.user?.addresses?.[0]?.country || "",
      shippingMethod: "standard",
      paymentMethod: "mpesa",
      couponCode: "",
    },
  });

  const shippingMethod = watch("shippingMethod");
  const shippingCost = cartTotals.subtotal >= 500 || shippingMethod === "express" ? (shippingMethod === "express" ? 45 : 0) : 25;
  const total = Math.max(0, cartTotals.subtotal - couponDiscount) + shippingCost;

  const handleApplyCoupon = async () => {
    const code = watch("couponCode")?.trim();
    if (!code) return;
    try {
      setApplyingCoupon(true);
      // Coupon validation handled server-side when order is created.
      // A dedicated endpoint can be added; here we optimistically show 10% off for demo codes starting with Zealc.ollection.
      if (code.toUpperCase().startsWith("Zealc.ollection")) {
        setCouponDiscount(Math.round(cartTotals.subtotal * 0.1));
        toast.success("Coupon applied: 10% discount");
      } else {
        toast.error("Invalid coupon code");
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const onSubmit = async (values) => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }
    try {
      setSubmitting(true);

      // 1. Create the order on the backend
      const { data } = await ordersAPI.create({
        items: cart.items.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          color: item.color,
          image: item.image,
          photoLabel: item.photoLabel || undefined,
        })),
        shipping: {
          name: `${values.firstName} ${values.lastName}`.trim(),
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          email: values.email,
          phone: values.phone,
        },
        shippingMethod: values.shippingMethod,
        paymentMethod: values.paymentMethod,
        couponCode: values.couponCode?.trim() || undefined,
      });

      // 2. Handle payment provider
      const order = data.order;

      if (values.paymentMethod === "paystack") {
        try {
          const { data: init } = await ordersAPI.initiatePaystack({ orderId: order._id });
          if (init.authorizationUrl) {
            window.location.href = init.authorizationUrl;
            return;
          }
        } catch (initErr) {
          toast.error(initErr.message || "Could not open the payment page - please try again");
          setSubmitting(false);
          return;
        }
      }

      if (values.paymentMethod === "mpesa") {
        try {
          toast.loading("Sending M-Pesa prompt to your phone...", { id: "mpesa-loading" });
          const { data: mpesa } = await ordersAPI.initiateMpesa({
            orderId: order._id,
            phoneNumber: values.phone,
          });
          toast.dismiss("mpesa-loading");
          toast.success(mpesa.message, { duration: 6000 });
          // Redirect to confirmation page - it will wait for the callback
          navigate(`/order-confirmation/${order._id}?method=mpesa`);
          return;
        } catch (mpesaErr) {
          toast.dismiss("mpesa-loading");
          toast.error(mpesaErr.message || "M-Pesa payment failed to start");
          setSubmitting(false);
          return;
        }
      }

      // 3. Order created (COD or payment completed)
      setOrderPlaced(order);
      clearCart();
      toast.success("Your order has been placed successfully");
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.soldOut) {
        // The product was bought by another client at the same moment.
        // The order was rejected and the item is no longer purchasable.
        toast.error(err.message || "This item is now sold out");
        clearCart();
        navigate("/cart");
        return;
      }
      if (String(err.message || "").toLowerCase().includes("stock")) {
        // Another client just claimed the last units - update the cart so
        // the customer cannot retry checkout with stale stock.
        toast.error(err.message || "Stock changed - please review your cart");
        navigate("/cart");
        return;
      }
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" description="Complete your Zealc.ollection order securely." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-16">
        <h1 className="section-heading text-3xl md:text-4xl text-center mb-12">
          Checkout
        </h1>

        {cart.items.length === 0 && !orderPlaced && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-onyx/20 mb-6" />
            <p className="font-display text-2xl mb-3">Your cart is empty</p>
            <p className="text-onyx/60 text-sm mb-8">Add items before checking out.</p>
            <Link to="/shop" className="btn-gold">
              Browse Collection
            </Link>
          </div>
        )}

        {cart.items.length > 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Shipping information */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="font-display text-xl mb-6 flex items-center gap-3">
                  <Truck size={18} className="text-gold" /> Shipping Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First Name" error={errors.firstName?.message} sm>
                    <input
                      {...register("firstName")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="Alexandra"
                    />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName?.message} sm>
                    <input
                      {...register("lastName")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="Montague"
                    />
                  </FormField>
                  <FormField label="Email Address" error={errors.email?.message} sm>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="you@example.com"
                    />
                  </FormField>
                  <FormField label="Phone Number" error={errors.phone?.message} sm>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="+1 000 000 0000"
                    />
                  </FormField>
                  <FormField label="Street Address" error={errors.address?.message} full>
                    <input
                      {...register("address")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="12 Luxury Lane, Suite 4"
                    />
                  </FormField>
                  <FormField label="City" error={errors.city?.message} sm>
                    <input
                      {...register("city")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="London"
                    />
                  </FormField>
                  <FormField label="State / Province" error={errors.state?.message} sm>
                    <input
                      {...register("state")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="Greater London"
                    />
                  </FormField>
                  <FormField label="ZIP / Postal Code" error={errors.zipCode?.message} sm>
                    <input
                      {...register("zipCode")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="SW1A 1AA"
                    />
                  </FormField>
                  <FormField label="Country" error={errors.country?.message} sm>
                    <input
                      {...register("country")}
                      className="w-full border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="United Kingdom"
                    />
                  </FormField>
                </div>
              </section>

              {/* Shipping method */}
              <section>
                <h2 className="font-display text-xl mb-4">Shipping Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`border p-5 cursor-pointer transition-colors ${watch("shippingMethod") === "standard" ? "border-gold bg-mist" : "border-mist"}`}>
                    <input type="radio" value="standard" {...register("shippingMethod")} className="sr-only" />
                    <p className="text-sm font-medium mb-1">Standard Delivery</p>
                    <p className="text-xs text-onyx/50 mb-2">3-5 business days</p>
                    <p className="text-sm font-display">
                      {cartTotals.subtotal >= 500 ? (
                        <span className="text-gold-dark">Complimentary</span>
                      ) : (
                        formatPrice(25)
                      )}
                    </p>
                  </label>
                  <label className={`border p-5 cursor-pointer transition-colors ${watch("shippingMethod") === "express" ? "border-gold bg-mist" : "border-mist"}`}>
                    <input type="radio" value="express" {...register("shippingMethod")} className="sr-only" />
                    <p className="text-sm font-medium mb-1">Express Delivery</p>
                    <p className="text-xs text-onyx/50 mb-2">1-2 business days, insured</p>
                    <p className="text-sm font-display">{formatPrice(45)}</p>
                  </label>
                </div>
              </section>

              {/* Payment method */}
              <section>
                <h2 className="font-display text-xl mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className={`border p-5 cursor-pointer transition-colors ${watch("paymentMethod") === "mpesa" ? "border-gold bg-mist" : "border-mist"}`}>
                    <input type="radio" value="mpesa" {...register("paymentMethod")} className="sr-only" />
                    <p className="text-sm font-medium mb-1">M-Pesa STK Push</p>
                    <p className="text-xs text-onyx/50">Instant prompt on your phone</p>
                  </label>
                  <label className={`border p-5 cursor-pointer transition-colors ${watch("paymentMethod") === "paystack" ? "border-gold bg-mist" : "border-mist"}`}>
                    <input type="radio" value="paystack" {...register("paymentMethod")} className="sr-only" />
                    <p className="text-sm font-medium mb-1">Pay with Card</p>
                    <p className="text-xs text-onyx/50">Visa, Mastercard via Paystack</p>
                  </label>
                  <label className={`border p-5 cursor-pointer transition-colors ${watch("paymentMethod") === "cod" ? "border-gold bg-mist" : "border-mist"}`}>
                    <input type="radio" value="cod" {...register("paymentMethod")} className="sr-only" />
                    <p className="text-sm font-medium mb-1">Cash on Delivery</p>
                    <p className="text-xs text-onyx/50">Pay when your order arrives</p>
                  </label>
                </div>
              </section>

              {/* Coupon */}
              <section>
                <h2 className="font-display text-xl mb-4">Promo Code</h2>
                <div className="flex gap-3 max-w-md">
                  <input
                    {...register("couponCode")}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-mist px-4 py-3.5 text-sm focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="btn-luxury-outline whitespace-nowrap disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-sm text-gold-dark mt-3">
                    Discount applied: -{formatPrice(couponDiscount)}
                  </p>
                )}
              </section>
            </div>

            {/* Order summary sidebar */}
            <aside className="lg:sticky lg:top-28 self-start border border-mist p-6 md:p-8 bg-mist/40">
              <h2 className="font-display text-xl mb-2">Your Order</h2>
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold-dark mb-5">
                {cart.items.length} Item{cart.items.length === 1 ? "" : "s"} in the bag
              </p>

              <div className="mb-6 max-h-80 overflow-y-auto pr-1 divide-y divide-mist">
                {cart.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.variant ?? ""}-${item.color ?? ""}-${item.photoIndex ?? ""}-${idx}`}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="w-14 h-[70px] shrink-0 bg-mist overflow-hidden">
                      {item.image ? (
                        <img src={imgThumb(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[8px] uppercase">IMG</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {(item.photoLabel || item.variant || item.color) && (
                        <p className="text-[9px] tracking-[0.18em] uppercase text-onyx/45 mt-1">
                          {[item.photoLabel, item.variant && `Size ${item.variant}`, item.color && `Colour ${item.color}`]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}
                      <p className="text-[9px] tracking-[0.18em] uppercase text-onyx/45 mt-0.5">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap self-start">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline border-t border-mist pt-5 mb-8">
                <span className="font-medium text-[11px] tracking-[0.2em] uppercase text-onyx/60">
                  Total{shippingCost > 0 ? " incl. shipping" : ""}
                </span>
                <span className="font-display text-2xl">{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full disabled:opacity-60"
              >
                {submitting ? "Processing..." : "Place Order"}
              </button>

                <p className="text-[10px] tracking-[0.1em] uppercase text-onyx/40 text-center mt-4">
                Secure checkout powered by Paystack
              </p>
            </aside>
          </form>
        )}
      </div>
    </>
  );
}

function FormField({ label, error, children, sm, full }) {
  return (
    <div className={sm ? "" : "sm:col-span-2"}>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-700 mt-1.5">{error}</p>}
    </div>
  );
}
