import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircle, Package } from "lucide-react";

import SEO from "../components/SEO";
import { ordersAPI } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../components/ProductCard";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { isAuthenticated, clearCart } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // ------------------------------------------------------------------
  // PAYSTACK VERIFY-ON-RETURN
  // After the customer pays, Paystack redirects here. We verify the
  // payment directly with Paystack (never trusting the client) and
  // refresh the order display without requiring a page reload.
  // ------------------------------------------------------------------
  const verifyPayment = async (quiet = false) => {
    if (!order) return;
    try {
      setVerifying(true);
      const { data } = await ordersAPI.verifyPaystack({
        reference: order.paymentReference,
        orderId: order._id,
      });
      if (!quiet) {
        if (data.verified) {
          toast.success("Payment confirmed");
        } else if (data.order?.paymentStatus === "failed") {
          toast.error("Payment failed - please try again");
        }
      }
      setOrder(data.order);

      // ----------------------------------------------------------------
      // AUTOMATIC CART CLEARING
      // The cart was already cleared on the checkout page for completed
      // orders, but when the customer pays via Paystack the browser
      // redirects away before the checkout page can clear the cart.
      // Clear it here as soon as the payment is verified as paid.
      // ----------------------------------------------------------------
      if (data.verified || data.order?.paymentStatus === "paid") {
        clearCart();
      }
    } catch (err) {
      if (!quiet) toast.error(err.message || "Could not check payment status");
    } finally {
      setVerifying(false);
    }
  };

  // Open the Paystack checkout for an order that was not yet paid.
  const completePayment = async () => {
    if (!order) return;
    try {
      setRedirecting(true);
      const { data } = await ordersAPI.initiatePaystack({ orderId: order._id });
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      setRedirecting(false);
      // Already paid - refresh the order view
      await verifyPayment(true);
    } catch (err) {
      setRedirecting(false);
      toast.error(err.message || "Could not open the payment page");
    }
  };

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    async function load() {
      try {
        const { data } = await ordersAPI.getById(orderId);
        if (!cancelled) setOrder(data.order);
      } catch {
        // The authenticated lookup failed (guest without a session or the
        // order belongs to a different account). Fall back to the public
        // order-number lookup so the person who just placed the order can
        // still see their confirmation.
        try {
          const { data } = await ordersAPI.getByNumber(orderId);
          if (!cancelled) setOrder(data.order);
        } catch {
          // Order details not retrievable; show generic confirmation
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // When returning from Paystack or waiting for M-Pesa STK Push, the
  // webhook/callback marks the order paid. Poll for status if pending.
  useEffect(() => {
    if (!order || order.paymentStatus !== "pending") return;

    // For Paystack: one quiet verification on load
    if (order.paymentMethod === "paystack" && !verifying && !redirecting) {
      const timer = setTimeout(() => verifyPayment(true), 800);
      return () => clearTimeout(timer);
    }

    // For M-Pesa: poll every 3 seconds until paid or failed
    if (order.paymentMethod === "mpesa") {
      const poll = setInterval(async () => {
        try {
          const { data } = await ordersAPI.getById(order._id);
          if (data.order.paymentStatus !== "pending") {
            setOrder(data.order);
            if (data.order.paymentStatus === "paid") {
              toast.success("M-Pesa payment received!");
              clearCart();
            }
            clearInterval(poll);
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 3000);
      return () => clearInterval(poll);
    }
  }, [order]);

  // Automatic cart clearing for already-paid orders
  useEffect(() => {
    if (order && order.paymentStatus === "paid") {
      clearCart();
    }
  }, [order]);

  return (
    <>
      <SEO title="Order Confirmed" description="Your Zealc.ollection order has been received." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-16 md:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <CheckCircle size={56} className="mx-auto text-gold mb-6" />
          <h1 className="font-display text-3xl md:text-5xl mb-4">
            Thank You for Your Order
          </h1>
          <p className="text-onyx/60 max-w-lg mx-auto mb-2 font-body">
            Your order has been received and is being carefully prepared. A
            confirmation has been sent to your email address.
          </p>
          {order && (
            <p className="text-[11px] tracking-[0.25em] uppercase text-onyx/50 mb-8">
              Order Reference: {order.orderNumber || order._id}
            </p>
          )}
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-xl mx-auto border border-mist text-left mt-10"
          >
            <div className="p-6 border-b border-mist flex items-center justify-between">
              <span className="text-[11px] tracking-[0.2em] uppercase text-onyx/60">
                Payment Status
              </span>
              <span className={`text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 ${
                order.paymentStatus === "paid"
                  ? "bg-gold/15 text-gold-dark"
                  : order.paymentStatus === "pending"
                  ? "bg-onyx/5 text-onyx/60"
                  : "bg-red-50 text-red-700"
              }`}>
                {order.paymentStatus || "Pending"}
              </span>
              {order.paymentStatus === "paid" && verifying && (
                <span className="text-[9px] tracking-[0.2em] uppercase text-onyx/50 ml-3">Verifying...</span>
              )}
            </div>
            <div className="p-6 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.2em] uppercase text-onyx/60">
                Order Total
              </span>
              <span className="font-display text-xl">{formatPrice(order.total)}</span>
            </div>
          </motion.div>
        )}

        {order && order.paymentStatus === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xl mx-auto border border-mist p-6 mt-6"
          >
            {order.paymentMethod === "mpesa" ? (
              <>
                <p className="font-display text-lg mb-2 text-gold-dark">Waiting for M-Pesa...</p>
                <p className="text-sm text-onyx/60 mb-2">
                  Please check your phone for the M-Pesa prompt and enter your PIN.
                </p>
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-onyx/40">
                  This page will update automatically once you pay.
                </p>
              </>
            ) : order.paymentMethod === "paystack" ? (
              <>
                <p className="font-display text-lg mb-2">Payment Pending</p>
                <p className="text-sm text-onyx/60 mb-5">
                  Your order is reserved, but we have not received the payment yet. Complete it now to secure your items.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={completePayment}
                    disabled={redirecting}
                    className="btn-gold disabled:opacity-60"
                  >
                    {redirecting ? "Opening payment page..." : "Complete Payment"}
                  </button>
                  <button
                    onClick={() => verifyPayment(false)}
                    disabled={verifying}
                    className="btn-luxury-outline disabled:opacity-60"
                  >
                    {verifying ? "Checking..." : "I have already paid"}
                  </button>
                </div>
              </>
            ) : null}
          </motion.div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated && (
            <Link to="/account/orders" className="btn-luxury">
              View My Orders
            </Link>
          )}
          <Link to="/shop" className="btn-luxury-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
}
