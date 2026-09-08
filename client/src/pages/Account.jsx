import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  User,
  Package,
  MapPin,
  Heart,
  Trash2,
  Plus,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import SEO from "../components/SEO";
import { imgThumb } from "../lib/imageOpt";
import { useApp } from "../context/AppContext";
import { ordersAPI, usersAPI } from "../lib/api";
import { formatPrice } from "../components/ProductCard";

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
});

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "ZIP/Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { auth, logout, updateProfile, wishlistState } = useApp();

  // The Account page supports two URL shapes for the same tabs:
  //   /account?tab=orders      (query parameter)
  //   /account/orders          (path - used by the navbar and order
  //                            confirmation links). A matching path
  //                            segment wins over the query parameter.
  const VALID_TABS = TABS.map((t) => t.id);
  const pathSegment = location.pathname
    .replace(/^\/+account\/+/, "")
    .split("/")[0]
    .trim();
  const initialTab =
    pathSegment && VALID_TABS.includes(pathSegment)
      ? pathSegment
      : searchParams.get("tab") || "overview";

  const [tab, setTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          ordersAPI.getMyOrders(),
          usersAPI.getAddresses(),
        ]);
        if (!cancelled) {
          setOrders(ordersRes.data.orders || []);
          setAddresses(addressesRes.data.addresses || []);
        }
      } catch {
        // Silently fall back to empty lists
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchParams({ tab }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <>
      <SEO title="My Account" description="Manage your Zealc.ollection account, orders and addresses." />

      {/* pt offsets the fixed navbar (desktop navbar is ~192px tall) so the
          heading and sections are never hidden beneath it. */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-16">
        <div className="mb-10">
          <p className="eyebrow mb-2">Private Client</p>
          <h1 className="section-heading text-3xl md:text-4xl">
            Welcome, {auth.user?.name?.split(" ")[0] || "Client"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs sidebar */}
          <aside className="lg:col-span-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto border-b lg:border-b-0 lg:border border-mist lg:p-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 whitespace-nowrap px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase transition-colors ${
                    tab === t.id
                      ? "bg-onyx text-ivory"
                      : "text-onyx/70 hover:bg-mist"
                  }`}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 whitespace-nowrap px-4 py-3.5 text-[11px] tracking-[0.2em] uppercase text-onyx/70 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </nav>

            {/* Admin entry - visible to administrators on all screen sizes,
                so the dashboard is reachable from the account page on mobile
                without opening the navbar menu. */}
            {auth.user?.role === "admin" && (
              <Link
                to="/admin"
                className="mt-4 flex items-center justify-between gap-3 border border-gold/40 bg-onyx px-4 py-3.5 hover:bg-onyx/90 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-gold" />
                  <span className="text-[11px] tracking-[0.2em] uppercase text-ivory">Admin Dashboard</span>
                </span>
                <ChevronRight size={14} className="text-gold/70" />
              </Link>
            )}
          </aside>

          {/* Tab content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {tab === "overview" && <OverviewTab user={auth.user} setTab={setTab} orders={orders} />}
                {tab === "orders" && <OrdersTab orders={orders} loading={loading} />}
                {tab === "addresses" && (
                  <AddressesTab
                    addresses={addresses}
                    loading={loading}
                    addressFormOpen={addressFormOpen}
                    setAddressFormOpen={setAddressFormOpen}
                    refreshAddresses={setAddresses}
                  />
                )}
                {tab === "wishlist" && <WishlistTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------
// Overview tab
// ------------------------------------------------------------------
function OverviewTab({ user, setTab, orders }) {
  return (
    <div className="space-y-8">
      <div className="border border-mist p-8">
        <h2 className="font-display text-xl mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50 mb-1">Full Name</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50 mb-1">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          {user?.phone && (
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50 mb-1">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50 mb-1">Member Since</p>
            <p className="font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Today"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTab("addresses")}
          className="btn-luxury-outline mt-8"
        >
          Manage Addresses
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <QuickCard
          title="Orders"
          value={orders.length.toString()}
          subtitle={orders.length === 1 ? "order placed" : "orders placed"}
          onClick={() => setTab("orders")}
        />
        <QuickCard
          title="Wishlist"
          value={String(wishlistState?.items?.length || 0)}
          subtitle="saved items"
          onClick={() => setTab("wishlist")}
        />
        <QuickCard
          title="Addresses"
          value={user?.addresses?.length?.toString() || "0"}
          subtitle="saved addresses"
          onClick={() => setTab("addresses")}
        />
      </div>
    </div>
  );
}

function QuickCard({ title, value, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-mist p-6 text-left hover:border-gold transition-colors"
    >
      <p className="font-display text-3xl mb-1">{value}</p>
      <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/60">{subtitle}</p>
    </button>
  );
}

// ------------------------------------------------------------------
// Orders tab
// ------------------------------------------------------------------
function OrdersTab({ orders, loading }) {
  if (loading) {
    return <div className="border border-mist p-10 text-center text-sm text-onyx/50">Loading orders...</div>;
  }
  if (orders.length === 0) {
    return (
      <div className="border border-mist p-12 text-center">
        <Package size={40} className="mx-auto text-onyx/20 mb-5" />
        <p className="font-display text-xl mb-3">No Orders Yet</p>
        <p className="text-onyx/60 text-sm mb-6">
          Your order history will appear here.
        </p>
        <Link to="/shop" className="btn-gold">
          Start Shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="border border-mist p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-mist">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50">
                Order Reference
              </p>
              <p className="text-sm font-medium">{order.orderNumber || order._id}</p>
            </div>
            <div className="flex gap-3">
              <StatusBadge status={order.paymentStatus} type="payment" />
              <StatusBadge status={order.orderStatus} type="order" />
            </div>
          </div>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-14 h-16 shrink-0 bg-mist overflow-hidden">
                  {item.image ? (
                    <img src={imgThumb(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[8px]">IMG</div>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-onyx/50 mt-0.5">
                    {item.variant && `Size: ${item.variant}`}
                    {item.variant && item.color && " / "}
                    {item.color && `Color: ${item.color}`}
                    {" / "}Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-display">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-mist text-sm">
            <span className="text-onyx/50">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
            </span>
            <span className="font-display text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, type }) {
  const colors =
    status === "paid" || status === "delivered"
      ? "bg-gold/15 text-gold-dark"
      : status === "pending" || status === "processing" || status === "shipped"
      ? "bg-onyx/5 text-onyx/60"
      : "bg-red-50 text-red-700";
  return (
    <span className={`text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 ${colors}`}>
      {status || (type === "payment" ? "Pending" : "Processing")}
    </span>
  );
}

// ------------------------------------------------------------------
// Addresses tab
// ------------------------------------------------------------------
function AddressesTab({ addresses, loading, addressFormOpen, setAddressFormOpen, refreshAddresses }) {
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const openNew = () => {
    setEditingId(null);
    reset({ label: "", street: "", city: "", state: "", zipCode: "", country: "" });
    setAddressFormOpen(true);
  };

  const openEdit = (address) => {
    setEditingId(address._id);
    reset(address);
    setAddressFormOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (editingId) {
        await usersAPI.updateAddress(editingId, values);
        toast.success("Address updated");
      } else {
        await usersAPI.addAddress(values);
        toast.success("Address added");
      }
      const { data } = await usersAPI.getAddresses();
      refreshAddresses(data.addresses || []);
      setAddressFormOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeAddress = async (id) => {
    try {
      await usersAPI.deleteAddress(id);
      const { data } = await usersAPI.getAddresses();
      refreshAddresses(data.addresses || []);
      toast.success("Address removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Saved Addresses</h2>
        <button type="button" onClick={openNew} className="btn-luxury-outline !px-5 !py-3 inline-flex items-center gap-2">
          <Plus size={14} /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="border border-mist p-10 text-center text-sm text-onyx/50">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="border border-mist p-12 text-center">
          <MapPin size={40} className="mx-auto text-onyx/20 mb-5" />
          <p className="font-display text-xl mb-3">No Saved Addresses</p>
          <p className="text-onyx/60 text-sm">Save an address to speed up future checkouts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address._id} className="border border-mist p-6 relative">
              {address.label && (
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold-dark mb-3">
                  {address.label}
                </p>
              )}
              <p className="text-sm leading-relaxed">
                {address.street}
                <br />
                {address.city}, {address.state} {address.zipCode}
                <br />
                {address.country}
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="text-[10px] tracking-[0.2em] uppercase text-onyx/60 hover:text-gold-dark"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeAddress(address._id)}
                  className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-onyx/60 hover:text-red-700"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {addressFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="border border-gold/40 bg-mist/40 p-6 mt-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg">{editingId ? "Edit Address" : "New Address"}</h3>
                <button
                  type="button"
                  onClick={() => setAddressFormOpen(false)}
                  aria-label="Close address form"
                  className="text-onyx/50 hover:text-onyx"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">Label (optional)</label>
                  <input
                    {...register("label")}
                    className="w-full border border-mist px-4 py-3 text-sm focus:outline-none focus:border-gold"
                    placeholder="Home, Office..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">Street Address</label>
                  <input
                    {...register("street")}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none focus:border-gold ${errors.street ? "border-red-400" : "border-mist"}`}
                  />
                  {errors.street && <p className="text-xs text-red-700 mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">City</label>
                  <input
                    {...register("city")}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none focus:border-gold ${errors.city ? "border-red-400" : "border-mist"}`}
                  />
                  {errors.city && <p className="text-xs text-red-700 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">State / Province</label>
                  <input
                    {...register("state")}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none focus:border-gold ${errors.state ? "border-red-400" : "border-mist"}`}
                  />
                  {errors.state && <p className="text-xs text-red-700 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">ZIP / Postal Code</label>
                  <input
                    {...register("zipCode")}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none focus:border-gold ${errors.zipCode ? "border-red-400" : "border-mist"}`}
                  />
                  {errors.zipCode && <p className="text-xs text-red-700 mt-1">{errors.zipCode.message}</p>}
                </div>
                <div>
                  <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">Country</label>
                  <input
                    {...register("country")}
                    className={`w-full border px-4 py-3 text-sm focus:outline-none focus:border-gold ${errors.country ? "border-red-400" : "border-mist"}`}
                  />
                  {errors.country && <p className="text-xs text-red-700 mt-1">{errors.country.message}</p>}
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-gold mt-6 disabled:opacity-60">
                {submitting ? "Saving..." : editingId ? "Update Address" : "Save Address"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// Wishlist tab (links to the wishlist page)
// ------------------------------------------------------------------
function WishlistTab() {
  const { wishlistState } = useApp();
  return (
    <div className="border border-mist p-12 text-center">
      <Heart size={40} className="mx-auto text-onyx/20 mb-5" />
      <p className="font-display text-xl mb-3">
        {wishlistState.items.length} {wishlistState.items.length === 1 ? "saved item" : "saved items"}
      </p>
      <p className="text-onyx/60 text-sm mb-6">
        Review and manage your saved pieces in your wishlist.
      </p>
      <Link to="/wishlist" className="btn-gold">
        Open Wishlist
      </Link>
    </div>
  );
}
