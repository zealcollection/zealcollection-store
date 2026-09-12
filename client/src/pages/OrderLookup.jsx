import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Package, MapPin, Mail } from "lucide-react";
import SEO from "../components/SEO";
import { ordersAPI } from "../lib/api";
import { imgThumb, OptimisedImg } from "../lib/imageOpt";
import { formatPrice } from "../components/ProductCard";

const STATUS_STEPS = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];

function statusLabel(status) {
  return String(status || "pending")
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export default function OrderLookup() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { data } = await ordersAPI.lookup({ orderNumber, email });
      setOrder(data.order);
    } catch (error) {
      setOrder(null);
      toast.error(error.message || "Order could not be found");
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = STATUS_STEPS.indexOf(order?.orderStatus);

  return (
    <>
      <SEO title="Track Your Order" description="Securely track your Zealc.ollection order." />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-[150px] md:pt-[230px] pb-20">
        <div className="max-w-xl mx-auto text-center">
          <p className="eyebrow mb-3">Order tracking</p>
          <h1 className="section-heading text-3xl md:text-5xl mb-4">Track your order</h1>
          <p className="text-sm text-onyx/60 mb-8">
            Enter the order number and the email used at checkout to see the latest delivery status.
          </p>
          <form onSubmit={lookup} className="border border-mist bg-ivory p-5 md:p-7 text-left space-y-4 shadow-[0_12px_35px_rgba(26,26,26,0.04)]">
            <label className="block">
              <span className="text-[10px] tracking-[0.16em] uppercase text-onyx/55">Order number</span>
              <div className="relative mt-2">
                <Package size={16} className="absolute left-3 top-3.5 text-onyx/40" />
                <input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="ZC-26-FIRSTNAME-XXXXXXXX" className="w-full border border-mist pl-10 pr-3 py-3 text-sm uppercase focus:outline-none focus:border-gold" />
              </div>
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.16em] uppercase text-onyx/55">Checkout email</span>
              <div className="relative mt-2">
                <Mail size={16} className="absolute left-3 top-3.5 text-onyx/40" />
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full border border-mist pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-gold" />
              </div>
            </label>
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? "Looking up order..." : "Track order"}
            </button>
          </form>
        </div>

        {order && (
          <section className="mt-12 border border-mist p-5 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-mist pb-6">
              <div>
                <p className="eyebrow">Order confirmation</p>
                <h2 className="font-display text-2xl mt-1">{order.orderNumber}</h2>
                <p className="text-xs text-onyx/55 mt-2">Placed {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="bg-gold/15 text-gold-dark px-3 py-2 text-[10px] tracking-[0.14em] uppercase">{statusLabel(order.orderStatus)}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-7">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className={`border-t-2 pt-3 ${index <= activeIndex ? "border-gold text-onyx" : "border-mist text-onyx/35"}`}>
                  <p className="text-[10px] tracking-[0.12em] uppercase">{statusLabel(step)}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-display text-xl mb-4">Items</h3>
                {order.items?.map((item, index) => (
                  <div key={`${item.product || item.name}-${index}`} className="flex items-center gap-4 border-b border-mist pb-3">
                    <div className="w-16 h-20 bg-mist shrink-0 overflow-hidden">
                      {item.image ? <OptimisedImg src={imgThumb(item.image)} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] text-onyx/35">NO IMAGE</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-onyx/55 mt-1">Quantity: {item.quantity}</p>
                      {(item.variant || item.color || item.photoLabel) && <p className="text-[10px] text-onyx/45 mt-1">{[item.photoLabel, item.variant && `Size ${item.variant}`, item.color && `Colour ${item.color}`].filter(Boolean).join(" / ")}</p>}
                    </div>
                    <p className="ml-auto text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-medium"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <div className="border border-mist p-5 text-sm space-y-4">
                <h3 className="font-display text-xl">Delivery details</h3>
                <p className="flex gap-2"><MapPin size={16} className="text-gold shrink-0" /><span>{order.shipping?.name}<br />{order.shipping?.street}<br />{order.shipping?.city}, {order.shipping?.state}<br />{order.shipping?.zipCode}, {order.shipping?.country}</span></p>
                <p className="text-xs text-onyx/60">Payment: {statusLabel(order.paymentStatus)} via {statusLabel(order.paymentMethod)}</p>
                <Link to={`/order-confirmation/${order._id}`} className="text-[10px] tracking-[0.14em] uppercase text-gold-dark hover:underline">Open confirmation page</Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
