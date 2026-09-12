import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Package,
  Tag,
  ClipboardList,
  Users,
  Star,
  Ticket,
  Mail,
  BarChart3,
  Plus,
  Trash2,
  Pencil,
  Edit3,
  X,
  DollarSign,
  ShoppingBag,
  UserPlus,
  Settings,
  ImagePlus,
} from "lucide-react";

import SEO from "../../components/SEO";
import { imgSrc, imgThumb } from "../../lib/imageOpt";
import { adminAPI, settingsAPI } from "../../lib/api";
import { formatPrice } from "../../components/ProductCard";

// ------------------------------------------------------------------
// Simple color name to hex helper for colour swatch previews in the
// product form (same palette as the product page).
// ------------------------------------------------------------------
function colorToHex(name) {
  const map = {
    Black: "#111111",
    Gold: "#D4AF37",
    Silver: "#C0C0C0",
    "Rose Gold": "#E0BFB8",
    "White Gold": "#F3EFC8",
    Camel: "#C19A6B",
    Ivory: "#FDFBF7",
    Midnight: "#1B1B3A",
    Champagne: "#F7E7CE",
    Blush: "#F5D5C8",
    Graphite: "#4A4A4A",
    Noir: "#111111",
    Platinum: "#E5E4E2",
  };
  return map[name] || "#E5E5E5";
}

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "settings", label: "Site Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderFilters, setOrderFilters] = useState({});

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === "analytics") {
        const res = await adminAPI.getAnalytics();
        setAnalytics(res.data?.analytics || res.analytics || null);
      } else if (tab === "products") {
        const [productsRes, categoriesRes] = await Promise.all([
          adminAPI.getProducts(),
          adminAPI.getCategories(),
        ]);
        setProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
      } else if (tab === "categories") {
        const res = await adminAPI.getCategories();
        setCategories(res.data.categories || []);
      } else if (tab === "orders") {
        const res = await adminAPI.getOrders();
        setOrders(res.data.orders || []);
      } else if (tab === "customers") {
        const res = await adminAPI.getCustomers();
        setCustomers(res.data.users || res.data.customers || []);
      } else if (tab === "reviews") {
        const res = await adminAPI.getReviews();
        setReviews(res.data.reviews || []);
      } else if (tab === "coupons") {
        const res = await adminAPI.getCoupons();
        setCoupons(res.data.coupons || []);
      } else if (tab === "newsletter") {
        const res = await adminAPI.getSubscribers();
        setSubscribers(res.data.subscribers || []);
      }
    } catch (error) {
      toast.error(error.message || "Could not load this section");
    } finally {
      setLoading(false);
    }
  }

  const refreshAll = () => loadData();

  const resetAnalytics = async () => {
    if (!window.confirm("Reset the analytics baseline now? Existing orders and products will not be deleted, but older activity will no longer appear in the analytics totals.")) {
      return;
    }
    try {
      const res = await adminAPI.resetAnalytics();
      const analyticsRes = await adminAPI.getAnalytics();
      setAnalytics(analyticsRes.data?.analytics || analyticsRes.analytics || null);
      toast.success(res.data?.message || "Analytics baseline reset");
    } catch (error) {
      toast.error(error.message || "Could not reset analytics");
    }
  };

  return (
    <>
      <SEO title="Admin Dashboard" description="Zealc.ollection administration panel." />

      {/* pt offsets the fixed navbar (desktop navbar is ~192px tall) so the
          sidebar and page content are never hidden beneath it. */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-10 md:pb-14">
        <div className="mb-10">
          <p className="eyebrow mb-2">Administration</p>
          <h1 className="section-heading text-3xl md:text-4xl">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto border-b lg:border-b-0 lg:border border-mist lg:p-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 whitespace-nowrap px-4 py-3 text-[11px] tracking-[0.15em] uppercase transition-colors ${
                    tab === t.id ? "bg-onyx text-ivory" : "text-onyx/70 hover:bg-mist"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {loading && tab === "analytics" ? (
                  <div className="border border-mist p-10 text-center text-sm text-onyx/50">Loading...</div>
                ) : tab === "analytics" ? (
                  <AnalyticsTab analytics={analytics} onReset={resetAnalytics} />
                ) : tab === "products" ? (
                  <ProductsTab
                    products={products}
                    categories={categories}
                    refresh={refreshAll}
                    formOpen={productFormOpen}
                    setFormOpen={setProductFormOpen}
                    editing={editingProduct}
                    setEditing={setEditingProduct}
                  />
                ) : tab === "categories" ? (
                  <CategoriesTab
                    categories={categories}
                    refresh={refreshAll}
                    formOpen={categoryFormOpen}
                    setFormOpen={setCategoryFormOpen}
                  />
                ) : tab === "orders" ? (
                  <OrdersTab orders={orders} refresh={refreshAll} filters={orderFilters} setFilters={setOrderFilters} />
                ) : tab === "customers" ? (
                  <CustomersTab customers={customers} />
                ) : tab === "reviews" ? (
                  <ReviewsTab reviews={reviews} refresh={refreshAll} />
                ) : tab === "coupons" ? (
                  <CouponsTab
                    coupons={coupons}
                    refresh={refreshAll}
                    formOpen={couponFormOpen}
                    setFormOpen={setCouponFormOpen}
                  />
                ) : tab === "newsletter" ? (
                  <NewsletterTab subscribers={subscribers} refresh={refreshAll} />
                ) : tab === "settings" ? (
                  <SettingsTab refresh={refreshAll} />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------
// Analytics tab
// ------------------------------------------------------------------
function AnalyticsTab({ analytics, onReset }) {
  const stats = [
    {
      label: "Total Revenue",
      value: analytics?.totalRevenue ? formatPrice(analytics.totalRevenue) : formatPrice(0),
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Total Customers",
      value: analytics?.totalCustomers ?? 0,
      icon: UserPlus,
    },
    {
      label: "Total Products",
      value: analytics?.totalProducts ?? 0,
      icon: Package,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl">Analytics overview</h2>
          <p className="text-[11px] text-onyx/50 mt-1">
            {analytics?.resetAt
              ? `Showing activity since ${new Date(analytics.resetAt).toLocaleString()}`
              : "Showing all recorded activity"}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="border border-onyx/20 px-4 py-2.5 text-[10px] tracking-[0.16em] uppercase hover:border-gold hover:text-gold-dark transition-colors"
        >
          Reset analytics baseline
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-mist p-6 flex items-center gap-5">
            <div className="w-12 h-12 flex items-center justify-center border border-gold/40 text-gold shrink-0">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-onyx/50">{stat.label}</p>
              <p className="font-display text-2xl mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {analytics?.revenueByMonth?.length > 0 && (
        <div className="border border-mist p-6">
          <h3 className="font-display text-lg mb-5">Revenue by Month</h3>
          <div className="space-y-3">
            {analytics.revenueByMonth.map((row) => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="w-16 text-[11px] tracking-[0.1em] uppercase text-onyx/60">
                  {row.month}
                </span>
                <div className="flex-1 bg-mist h-6 relative">
                  <div
                    className="bg-gold h-full"
                    style={{
                      width: `${Math.min(100, (row.revenue / (analytics.maxMonthlyRevenue || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-24 text-right">
                  {formatPrice(row.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics?.ordersByStatus?.length > 0 && (
        <div className="border border-mist p-6 mt-6">
          <h3 className="font-display text-lg mb-5">Orders by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.ordersByStatus.map((row) => (
              <div key={row.status} className="bg-mist p-5 text-center">
                <p className="font-display text-2xl">{row.count}</p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50 mt-1">{row.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Products tab
// ------------------------------------------------------------------
function ProductsTab({ products, categories, refresh, formOpen, setFormOpen, editing, setEditing }) {
  const [deleteId, setDeleteId] = useState(null);

  const removeProduct = async (id) => {
    try {
      await adminAPI.deleteProduct(id);
      toast.success("Product deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Products ({products.length})</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="btn-gold !px-5 !py-3 inline-flex items-center gap-2"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">
          No products yet. Add your first product to begin.
        </div>
      ) : (
        <div className="border border-mist overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left">
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Product</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Category</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Audience</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Price</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Stock</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-mist last:border-0 hover:bg-mist/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-mist shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={imgSrc(product.images[0], 200)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[7px]">IMG</div>
                        )}
                      </div>
                      <div className="min-w-[140px]">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-[10px] text-onyx/50">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-onyx/70">{product.category?.name || "-"}</td>
                  <td className="px-4 py-3 text-onyx/70 capitalize">{product.gender || "unisex"}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-700" />
                        Sold Out
                      </span>
                    ) : (
                      <span className="text-onyx/70">{product.stock} in stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(product);
                          setFormOpen(true);
                        }}
                        className="text-onyx/50 hover:text-gold-dark"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(product._id)}
                        className="text-onyx/50 hover:text-red-700"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <ProductFormModal
            product={editing}
            categories={categories}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSaved={() => {
              setFormOpen(false);
              setEditing(null);
              refresh();
            }}
          />
        )}
        {deleteId && (
          <ConfirmModal
            title="Delete Product"
            message="This action cannot be undone. Are you sure you want to delete this product?"
            onConfirm={() => removeProduct(deleteId)}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductFormModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    cardDescription: product?.cardDescription || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "0",
    category: product?.category?._id || "",
    variants: (product?.variants || []).join(", "),
    colors: (product?.colors || []).join(", "),
    images: (product?.images || []).join("\n"),
    photoLabels: (product?.photoLabels || []).join("\n"),
    isNew: product?.isNew || false,
    comingSoon: product?.comingSoon || false,
    featured: product?.featured || false,
    gender: product?.gender || "unisex",
  });
  // ------------------------------------------------------------------
  // COLOUR IMAGES - one photo per colour. When a shopper selects a
  // colour on the product page, this matching image is shown.
  // Each entry: { color: "Noir", image: "https://..." }
  // ------------------------------------------------------------------
  const [colorImages, setColorImages] = useState(
    product?.colorImages || []
  );
  const [colorUploading, setColorUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // ------------------------------------------------------------------
  // DEVICE IMAGE UPLOAD: pick files from any device; the authenticated
  // server sends them to Cloudinary and adds the returned permanent URLs
  // to the images list below.
  // ------------------------------------------------------------------
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState(
    (product?.images || []).filter((s) => s && s.trim())
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setCheck = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error("Please fill in product name and category");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        price: form.price.trim() === "" ? 0 : parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        variants: form.variants
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: form.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        // Keep only colour image entries whose colour still exists
        colorImages: colorImages.filter((c) =>
          form.colors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .some((name) => name.toLowerCase() === c.color.toLowerCase())
        ),
        // Images: URLs pasted manually OR uploaded from the computer via the
        // image picker below (they are merged into the same list).
        images: form.images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        // One label per photo (same order as the images above). A blank line
        // leaves that photo unnamed - only fill in the ones you want labelled.
        photoLabels: form.photoLabels
          .split("\n")
          .map((s) => s.trim()),
        // Card blurb: trimmed text shown on product cards and the Bestsellers
        // section - empty string means "fall back to the full description"
        cardDescription: (form.cardDescription || "").trim(),
        // Best Seller flag: controls whether the product appears in the
        // Bestsellers section on the home page
        featured: !!form.featured,
      };
      if (product) {
        await adminAPI.updateProduct(product._id, payload);
        toast.success("Product updated");
      } else {
        await adminAPI.createProduct(payload);
        toast.success("Product created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title={product ? "Edit Product" : "Add Product"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name">
            <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Royal Chronograph" />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={set("slug")} className={inputCls} placeholder="royal-chronograph" />
          </Field>
          <Field label="Price (KES)">
            <input type="number" step="0.01" value={form.price} onChange={set("price")} className={inputCls} placeholder="1290" />
          </Field>
          <Field label="Stock">
            <input type="number" value={form.stock} onChange={set("stock")} className={inputCls} placeholder="10" />
            <p className="mt-1 text-[10px] text-onyx/50">Set to 0 to mark the product as Sold Out on the storefront.</p>
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={set("category")} className={inputCls}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Audience (shopper section)">
            <select value={form.gender} onChange={set("gender")} className={inputCls}>
              <option value="men">Men</option>
              <option value="ladies">Ladies</option>
              <option value="unisex">Everyone (Unisex)</option>
            </select>
            <p className="mt-1 text-[10px] text-onyx/50">Decides whether the product appears in the Men or Ladies section of the storefront.</p>
          </Field>
          <Field label="Variants (comma separated)">
            <input value={form.variants} onChange={set("variants")} className={inputCls} placeholder="40mm, 42mm" />
          </Field>
          <Field label="Colors (comma separated)">
            <input value={form.colors} onChange={set("colors")} className={inputCls} placeholder="Gold, Silver" />
            <p className="mt-1 text-[10px] text-onyx/50">Names must match exactly (e.g. Noir, Ivory, Gold) - each colour below gets its own photo.</p>
          </Field>
        </div>
        {/* ------------------------------------------------------------------
            COLOUR IMAGES - one photo per colour. Shoppers see the matching
            photo when they select a colour on the product page.
        ------------------------------------------------------------------ */}
        <Field label="Colour Images (one photo per colour)">
          <div className="space-y-3">
            {form.colors
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((colorName) => {
                const entry = colorImages.find(
                  (c) => c.color.toLowerCase() === colorName.toLowerCase()
                );
                return (
                  <div
                    key={colorName}
                    className="flex items-center gap-3 border border-onyx/15 bg-ivory rounded-md px-3 py-2.5"
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-onyx/20 shrink-0"
                      style={{ backgroundColor: colorToHex(colorName) }}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] tracking-[0.15em] uppercase text-onyx w-20 truncate">
                      {colorName}
                    </span>
                    {entry?.image ? (
                      <img
                        src={imgSrc(entry.image, 200)}
                        alt={`${colorName} preview`}
                        className="w-14 h-14 object-cover rounded-md border border-onyx/15"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-md border border-dashed border-onyx/25 bg-mist flex items-center justify-center">
                        <span className="text-[9px] text-onyx/35 tracking-widest uppercase">None</span>
                      </div>
                    )}
                    <div className="flex-1 flex items-center gap-2">
                      <label
                        className="flex-1 cursor-pointer"
                        title="Upload the image for this colour"
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={colorUploading !== null}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []).filter((f) =>
                              /jpe?g|png|gif|webp/.test(f.type)
                            );
                            if (files.length === 0) return;
                            const file = files[0];
                            if (file.size > 8 * 1024 * 1024) {
                              toast.error("Image must be under 8 MB");
                              return;
                            }
                            try {
                              setColorUploading(colorName);
                              const res = await adminAPI.uploadProductImages([file]);
                              const urls = res.data.urls || [];
                              const url = urls[0];
                              setColorImages((prev) => {
                                const rest = prev.filter(
                                  (c) => c.color.toLowerCase() !== colorName.toLowerCase()
                                );
                                return [...rest, { color: colorName, image: url }];
                              });
                              toast.success(`${colorName} image added`);
                            } catch (err) {
                              toast.error(err.message || "Upload failed");
                            } finally {
                              setColorUploading(null);
                              e.target.value = "";
                            }
                          }}
                        />
                        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase border border-onyx/25 px-3 py-2 rounded-md hover:border-gold hover:text-gold-dark transition-colors">
                          {colorUploading === colorName ? "Uploading..." : "Pick colour image"}
                        </span>
                      </label>
                      <input
                        value={entry?.image || ""}
                        onChange={(e) => {
                          const url = e.target.value.trim();
                          setColorImages((prev) => {
                            const rest = prev.filter(
                              (c) => c.color.toLowerCase() !== colorName.toLowerCase()
                            );
                            return url ? [...rest, { color: colorName, image: url }] : rest;
                          });
                        }}
                        placeholder="Or paste URL..."
                        className="flex-1 min-w-0 text-[11px] font-mono px-2.5 py-2 border border-onyx/20 rounded-md focus:outline-none focus:border-gold"
                      />
                    </div>
                    {entry?.image && (
                      <button
                        type="button"
                        aria-label={`Remove ${colorName} image`}
                        className="text-onyx/40 hover:text-onyx p-1.5"
                        onClick={() =>
                          setColorImages((prev) =>
                            prev.filter(
                              (c) => c.color.toLowerCase() !== colorName.toLowerCase()
                            )
                          )
                        }
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            {!form.colors && (
              <p className="text-[11px] text-onyx/45 italic">
                Type colour names in the Colors field above - one row per colour appears here.
              </p>
            )}
          </div>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="New Arrival">
            <label className="flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={form.isNew} onChange={setCheck("isNew")} className="accent-[#d4af37] w-4 h-4" />
              <span className="text-sm">Mark as new arrival</span>
            </label>
            <p className="text-[10px] text-onyx/50">Also tick "Coming Soon" to announce a piece that is not yet purchasable.</p>
          </Field>
          <Field label="Coming Soon">
            <label className="flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={form.comingSoon} onChange={setCheck("comingSoon")} className="accent-[#d4af37] w-4 h-4" />
              <span className="text-sm">Show "Coming Soon" tag</span>
            </label>
          </Field>
          <Field label="Sold Out">
            <label className="flex items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={parseInt(form.stock, 10) === 0}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.checked ? "0" : f.stock === "0" ? "1" : f.stock }))}
                className="accent-[#d4af37] w-4 h-4"
              />
              <span className="text-sm">Mark as sold out (stock = 0)</span>
            </label>
          </Field>
          <Field label="Best Seller">
            <label className="flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={!!form.featured} onChange={setCheck("featured")} className="accent-[#d4af37] w-4 h-4" />
              <span className="text-sm">Feature in Bestsellers</span>
            </label>
            <p className="text-[10px] text-onyx/50">Shows this product in the Bestsellers section on the home page (max 12).</p>
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={set("description")} rows={4} className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Card Blurb (shown on product cards & the Bestsellers section)">
          <textarea
            value={form.cardDescription}
            onChange={set("cardDescription")}
            rows={2}
            maxLength={160}
            placeholder="A short, elegant line - e.g. A timeless silhouette in Italian calfskin."
            className={`${inputCls} resize-none`}
          />
          <p className="mt-1 text-[11px] text-onyx/50">
            One refined line for the cards. When left empty, the start of the full description is used instead.
          </p>
        </Field>
        <Field label={`Images (pick files from your computer, or paste one URL per line below)`}>
          {/* ------------------------------------------------------------------
              DEVICE UPLOAD PICKER: the files chosen here are sent through the
              authenticated server to Cloudinary. Maximum 100 files, 8 MB each.
          ------------------------------------------------------------------ */}
          <div className="space-y-3">
            <label
              htmlFor="product-image-files"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gold/40 bg-gold/5 rounded-md px-4 py-6 cursor-pointer hover:border-gold/70 hover:bg-gold/10 transition-colors text-center"
            >
              {uploading ? (
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between text-[11px] text-onyx/60 mb-1.5">
                    <span>Uploading images...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-onyx/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ImagePlus className="w-6 h-6 text-gold-dark" />
                  <span className="text-sm text-onyx/70">
                    Click to choose product images from your computer
                  </span>
                  <span className="text-[10px] text-onyx/45 tracking-wide">
                    JPG, PNG or WEBP - up to 100 images, 8 MB each
                  </span>
                </>
              )}
              <input
                id="product-image-files"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).filter((f) =>
                    /jpe?g|png|gif|webp/.test(f.type)
                  );
                  if (files.length === 0) return;
                  const existingImageCount = form.images
                    .split("\n")
                    .map((url) => url.trim())
                    .filter(Boolean).length;
                  if (existingImageCount + files.length > 100) {
                    toast.error(`A product can have a maximum of 100 images. You already have ${existingImageCount}.`);
                    return;
                  }
                  try {
                    setUploading(true);
                    setUploadProgress(5);
                    const res = await adminAPI.uploadProductImages(files);
                    setUploadProgress(100);
                    const urls = res.data.urls || [];
                    setPreviewUrls((prev) => [...prev, ...urls]);
                    setForm((f) => ({
                      ...f,
                      images: [...f.images.split("\n"), ...urls].filter(Boolean).join("\n"),
                    }));
                    toast.success(`Added ${urls.length} image${urls.length > 1 ? "s" : ""} to this product`);
                  } catch (err) {
                    toast.error(err.message || "Image upload failed");
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {previewUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative group aspect-square rounded-md overflow-hidden border border-onyx/15 bg-mist">
                    <img src={imgSrc(url, 320)} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute top-1 right-1 bg-onyx/70 text-ivory rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setPreviewUrls((prev) => prev.filter((_, j) => j !== i));
                        setForm((f) => ({
                          ...f,
                          images: f.images
                            .split("\n")
                            .filter((s) => s.trim() !== url)
                            .join("\n"),
                        }));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={form.images}
              onChange={set("images")}
              rows={2}
              placeholder={"Optional: paste a URL here if you have one\nhttps://.../image1.jpg"}
              className={`${inputCls} resize-none font-mono text-xs`}
            />
          </div>
        </Field>
        {/* ------------------------------------------------------------------
            PHOTO LABELS - name each photo (same order as the images above)
            so the cart records exactly the item the shopper selected on the
            card. Leave a line blank to keep that photo unnamed.
        ------------------------------------------------------------------ */}
        <Field label="Photo Labels (one per photo, same order as Images)">
          <textarea
            value={form.photoLabels}
            onChange={set("photoLabels")}
            rows={2}
            placeholder={"E.g. one label per line:\nMonaco Leather Tote\nSavoy Crossbody"}
            className={`${inputCls} resize-none text-xs`}
          />
          <p className="mt-1 text-[11px] text-onyx/50">
            When one card holds several items, each label names its photo - shoppers see the label in their cart and you see it in orders. Leave lines blank for unnamed photos.
          </p>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
            {submitting ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
          <button type="button" onClick={onClose} className="btn-luxury-outline">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ------------------------------------------------------------------
// Categories tab
// ------------------------------------------------------------------
function CategoriesTab({ categories, refresh, formOpen, setFormOpen }) {
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", image: "", images: "", gender: "unisex" });
  const [submitting, setSubmitting] = useState(false);

  const openEdit = (category) => {
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      image: category.image || "",
      images: (category.images || []).join("\n"),
      gender: ["men", "ladies", "unisex"].includes(category.gender) ? category.gender : "unisex",
    });
    setEditId(category._id);
    setFormOpen(true);
  };

  const remove = async (id) => {
    try {
      await adminAPI.deleteCategory(id);
      toast.success("Category deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Please fill in name and slug");
      return;
    }
    try {
      setSubmitting(true);
      // ------------------------------------------------------------------
      // CLOUDINARY: Paste the category image URL in the Image field, and
      // extra slideshow images one per line in the Slideshow Images field.
      // ------------------------------------------------------------------
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        image: form.image.trim(),
        images: form.images
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        gender: form.gender,
      };
      if (editId) {
        await adminAPI.updateCategory(editId, payload);
        toast.success("Category updated");
      } else {
        await adminAPI.createCategory(payload);
        toast.success("Category created");
      }
      setForm({ name: "", slug: "", image: "", images: "", gender: "unisex" });
      setEditId(null);
      setFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Categories ({categories.length})</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn-gold !px-5 !py-3 inline-flex items-center gap-2">
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="border border-mist p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-mist shrink-0 overflow-hidden">
                {category.image ? (
                  <img src={imgSrc(category.image, 320)} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[7px]">IMG</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{category.name}</p>
                <p className="text-[10px] text-onyx/50">
                  {category.slug} ·{" "}
                  <span className="text-gold capitalize">{category.gender || "unisex"}</span>
                </p>
                {(category.images || []).length > 0 && (
                  <p className="text-[10px] text-gold">{(category.images || []).length} slideshow image{(category.images || []).length > 1 ? "s" : ""}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(category)}
                className="text-onyx/40 hover:text-gold"
                aria-label={`Edit category ${category.name}`}
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteId(category._id)}
                className="text-onyx/40 hover:text-red-700"
                aria-label={`Delete category ${category.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {formOpen && (
          <Modal onClose={() => { setFormOpen(false); setEditId(null); }} title={editId ? "Edit Category" : "Add Category"}>
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Category Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Watches"
                />
              </Field>
              <Field label="Slug">
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className={inputCls}
                  placeholder="watches"
                />
              </Field>
              <Field label="Image URL (CLOUDINARY)">
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className={`${inputCls} font-mono text-xs`}
                  placeholder="https://res.cloudinary.com/.../category-watches.jpg"
                />
              </Field>
              <Field label="Slideshow Images (one URL per line)">
                <textarea
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  rows={4}
                  className={`${inputCls} font-mono text-xs resize-y`}
                  placeholder={"https://res.cloudinary.com/.../slide-1.jpg\nhttps://res.cloudinary.com/.../slide-2.jpg\nhttps://res.cloudinary.com/.../slide-3.jpg"}
                />
                <p className="mt-1 text-[10px] text-onyx/50 leading-relaxed">
                  The category card on the home page crossfades through these images every 6 seconds. The Image URL above is always the first slide. Recommended size: 900 x 1200 px, JPG/PNG/WEBP.
                </p>
              </Field>
              <Field label="Section">
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className={inputCls}
                >
                  <option value="men">Men</option>
                  <option value="ladies">Ladies</option>
                  <option value="unisex">Unisex</option>
                </select>
                <p className="mt-1 text-[10px] text-onyx/50 leading-relaxed">
                  Decides where this category card appears in the shop: the Men page, the Ladies page, or the Unisex page. Unisex categories show in all three sections.
                </p>
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
                  {submitting ? "Saving..." : editId ? "Update Category" : "Create Category"}
                </button>
                <button type="button" onClick={() => { setFormOpen(false); setEditId(null); }} className="btn-luxury-outline">
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
        {deleteId && (
          <ConfirmModal
            title="Delete Category"
            message="Delete this category? Products in this category will become uncategorized."
            onConfirm={() => remove(deleteId)}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// Orders tab
// ------------------------------------------------------------------
function OrdersTab({ orders, refresh, filters, setFilters }) {
  const orderStatuses = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
  const paymentStatuses = ["pending", "paid", "failed", "refunded"];
  const [deliveryCodes, setDeliveryCodes] = useState({});
  const [issuingDeliveryCode, setIssuingDeliveryCode] = useState({});
  const statusLabel = (value) => String(value || "pending").replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
  const statusClass = (value, type) => {
    if (type === "payment") {
      return value === "paid"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : value === "failed" || value === "refunded"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
    }
    return value === "delivered"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === "cancelled"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-onyx/5 text-onyx/70 border-mist";
  };
  const updateStatus = async (id, key, value) => {
    try {
      await adminAPI.updateOrder(id, { [key]: value });
      toast.success("Order updated");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const issueDeliveryCode = async (id) => {
    if (issuingDeliveryCode[id]) return;
    try {
      setIssuingDeliveryCode((current) => ({ ...current, [id]: true }));
      const response = await adminAPI.issueDeliveryCode(id);
      toast.success(response.data?.message || "Delivery code issued");
      refresh();
    } catch (err) {
      toast.error(err.message || "Could not issue delivery code");
    } finally {
      setIssuingDeliveryCode((current) => ({ ...current, [id]: false }));
    }
  };

  const verifyDelivery = async (id) => {
    try {
      await adminAPI.verifyDelivery(id, deliveryCodes[id] || "");
      setDeliveryCodes((current) => ({ ...current, [id]: "" }));
      toast.success("Delivery verified");
      refresh();
    } catch (err) {
      toast.error(err.message || "Could not verify delivery");
    }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.orderNumber || order._id}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteOrder(order._id);
      toast.success("Order history deleted");
      refresh();
    } catch (err) {
      toast.error(err.message || "Could not delete order history");
    }
  };

  const filtered = orders.filter((order) => {
    if (filters.status && order.orderStatus !== filters.status) return false;
    if (filters.payment && order.paymentStatus !== filters.payment) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="mr-auto">
          <h2 className="font-display text-xl">Orders ({filtered.length})</h2>
          <p className="text-[10px] tracking-[0.16em] uppercase text-onyx/45 mt-1">
            Fulfillment and payment are tracked separately
          </p>
        </div>
        <select
          value={filters.status || ""}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          className="border border-mist px-3 py-2 text-xs focus:outline-none focus:border-gold"
        >
          <option value="">All Order Statuses</option>
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          value={filters.payment || ""}
          onChange={(e) => setFilters((f) => ({ ...f, payment: e.target.value || undefined }))}
          className="border border-mist px-3 py-2 text-xs focus:outline-none focus:border-gold"
        >
          <option value="">All Payment Statuses</option>
          {["pending", "paid", "failed", "refunded"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="border border-mist bg-ivory p-5 md:p-6 shadow-[0_8px_30px_rgba(26,26,26,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-onyx/50">Order</p>
                  <p className="text-sm font-medium">{order.orderNumber || order._id}</p>
                  <p className="text-[11px] text-onyx/50 mt-0.5">
                    {order.user?.name || "Guest"} - {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                  </p>
                  {order.deliveryIssues?.length > 0 && order.deliveryIssues[order.deliveryIssues.length - 1]?.status === "open" && (
                    <div className="mt-2 text-[10px] text-red-700">
                      <p className="tracking-[0.12em] uppercase">Delivery issue reported: {order.deliveryIssues[order.deliveryIssues.length - 1].reason}</p>
                      <p className="mt-1 text-red-700/80 max-w-md">{order.deliveryIssues[order.deliveryIssues.length - 1].message}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] tracking-[0.16em] uppercase text-onyx/45">Order status</span>
                    <select
                      value={order.orderStatus || "pending"}
                      onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                      className={`border px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase focus:outline-none focus:border-gold ${statusClass(order.orderStatus, "order")}`}
                    >
                      {orderStatuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[9px] tracking-[0.16em] uppercase text-onyx/45">Payment status</span>
                    <select
                      value={order.paymentStatus || "pending"}
                      onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                      className={`border px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase focus:outline-none focus:border-gold ${statusClass(order.paymentStatus, "payment")}`}
                    >
                      {paymentStatuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                  </label>
                  <span className="font-display text-lg ml-2">{formatPrice(order.total)}</span>
                  <button
                    type="button"
                    onClick={() => deleteOrder(order)}
                    title="Delete order history"
                    className="border border-red-200 text-red-700 p-2 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 border border-mist/80 bg-mist/20 p-4 text-xs">
                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-onyx/45 mb-1">Customer</p>
                  <p className="font-medium">{order.shipping?.name || order.user?.name || "Guest"}</p>
                  <p className="text-onyx/60">{order.shipping?.email || order.user?.email || "No email provided"}</p>
                  <p className="text-onyx/60">{order.shipping?.phone || "No phone provided"}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-onyx/45 mb-1">Delivery address</p>
                  <p>{order.shipping?.street || "-"}</p>
                  <p>{[order.shipping?.city, order.shipping?.state].filter(Boolean).join(", ") || "-"}</p>
                  <p>{[order.shipping?.zipCode, order.shipping?.country].filter(Boolean).join(", ") || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.16em] uppercase text-onyx/45 mb-1">Checkout</p>
                  <p>Payment: <span className="capitalize">{order.paymentMethod || "-"}</span></p>
                  <p>Shipping: <span className="capitalize">{order.shippingMethod || "standard"}</span></p>
                  <p>Reference: {order.paymentReference || "Not assigned"}</p>
                </div>
              </div>
              {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
                <div className="flex flex-wrap items-end gap-3 mb-5 border border-gold/25 bg-gold/5 p-3">
                  <div className="mr-auto">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-gold-dark">Delivery verification</p>
                    <p className="text-[11px] text-onyx/55 mt-1">Issue a code when the parcel leaves, then verify it at handover.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => issueDeliveryCode(order._id)}
                    disabled={issuingDeliveryCode[order._id] || Boolean(order.deliveryOtpExpiresAt && new Date(order.deliveryOtpExpiresAt) > new Date())}
                    className="border border-gold/60 px-3 py-2 text-[10px] tracking-[0.12em] uppercase hover:bg-gold/10"
                  >
                    {issuingDeliveryCode[order._id] ? "Sending..." : order.deliveryOtpExpiresAt ? "Code already issued" : "Issue delivery code"}
                  </button>
                  {order.deliveryOtpExpiresAt && (
                    <div className="flex items-center gap-2">
                      <input
                        value={deliveryCodes[order._id] || ""}
                        onChange={(event) => setDeliveryCodes((current) => ({ ...current, [order._id]: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        className="w-28 border border-onyx/20 px-3 py-2 text-xs focus:outline-none focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => verifyDelivery(order._id)}
                        className="bg-onyx text-ivory px-3 py-2 text-[10px] tracking-[0.12em] uppercase hover:bg-onyx/85"
                      >
                        Verify delivery
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 border border-mist/80 bg-mist/25 p-3 text-sm min-w-0">
                    <div className="w-16 h-20 md:w-20 md:h-24 bg-mist shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={imgThumb(item.image)}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-onyx/20 text-[8px] tracking-[0.15em]">NO IMAGE</div>
                      )}
                    </div>
                    <span className="flex flex-col min-w-0 gap-1">
                      <span className="font-medium leading-snug">{item.name}</span>
                      <span className="text-[11px] text-onyx/55">Quantity: {item.quantity}</span>
                      {item.variant || item.color || item.photoLabel ? (
                        <span className="text-[9px] tracking-[0.12em] uppercase text-onyx/45 truncate">
                          {[item.photoLabel, item.variant && `Size ${item.variant}`, item.color && `Colour ${item.color}`]
                            .filter(Boolean)
                            .join(" / ")}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Customers tab
// ------------------------------------------------------------------
function CustomersTab({ customers }) {
  return (
    <div>
      <h2 className="font-display text-xl mb-6">Customers ({customers.length})</h2>
      {customers.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">No customers yet.</div>
      ) : (
        <div className="border border-mist overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left">
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Name</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Email</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Role</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user._id} className="border-b border-mist last:border-0 hover:bg-mist/40">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-onyx/70">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 ${
                      user.role === "admin" ? "bg-gold/15 text-gold-dark" : "bg-mist text-onyx/60"
                    }`}>
                      {user.role || "customer"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-onyx/60">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Reviews tab
// ------------------------------------------------------------------
function ReviewsTab({ reviews, refresh }) {
  const remove = async (id) => {
    try {
      await adminAPI.deleteReview(id);
      toast.success("Review deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border border-mist p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} className="text-gold" fill="currentColor" />
                  ))}
                  <span className="text-sm font-medium">{review.user?.name || "Client"}</span>
                </div>
                {review.title && <p className="font-medium text-sm">{review.title}</p>}
                <p className="text-sm text-onyx/70 mt-1 max-w-2xl">{review.comment}</p>
                <p className="text-[10px] text-onyx/50 mt-2">
                  Product: {review.product?.name || review.productId || "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(review._id)}
                className="text-onyx/40 hover:text-red-700 shrink-0"
                aria-label="Delete review"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Coupons tab
// ------------------------------------------------------------------
function CouponsTab({ coupons, refresh, formOpen, setFormOpen }) {
  const [form, setForm] = useState({ code: "", discount: "", type: "percentage", minOrder: "" });
  const [submitting, setSubmitting] = useState(false);

  const remove = async (id) => {
    try {
      await adminAPI.deleteCoupon(id);
      toast.success("Coupon deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount) {
      toast.error("Please fill in code and discount");
      return;
    }
    try {
      setSubmitting(true);
      await adminAPI.createCoupon({
        code: form.code.trim().toUpperCase(),
        discount: parseFloat(form.discount),
        type: form.type,
        minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
      });
      toast.success("Coupon created");
      setForm({ code: "", discount: "", type: "percentage", minOrder: "" });
      setFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Coupons ({coupons.length})</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn-gold !px-5 !py-3 inline-flex items-center gap-2">
          <Plus size={14} /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">No coupons yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="border border-mist p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-sm font-bold tracking-wider">{coupon.code}</p>
                <button
                  type="button"
                  onClick={() => remove(coupon._id)}
                  className="text-onyx/40 hover:text-red-700"
                  aria-label={`Delete coupon ${coupon.code}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-onyx/70">
                {coupon.type === "percentage" ? `${coupon.discount}% off` : `${formatPrice(coupon.discount)} off`}
                {coupon.minOrder ? ` (min ${formatPrice(coupon.minOrder)})` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <Modal onClose={() => setFormOpen(false)} title="Add Coupon">
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Coupon Code">
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className={`${inputCls} font-mono uppercase`}
                  placeholder="Zealc.ollection10"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Discount">
                  <input
                    type="number"
                    step="0.01"
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    className={inputCls}
                    placeholder="10"
                  />
                </Field>
                <Field label="Type">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </Field>
              </div>
              <Field label="Minimum Order (optional)">
                <input
                  type="number"
                  step="0.01"
                  value={form.minOrder}
                  onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                  className={inputCls}
                  placeholder="500"
                />
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
                  {submitting ? "Saving..." : "Create Coupon"}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="btn-luxury-outline">
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------
// Newsletter tab
// ------------------------------------------------------------------
function NewsletterTab({ subscribers, refresh }) {
  const remove = async (id) => {
    try {
      await adminAPI.deleteSubscriber(id);
      toast.success("Subscriber removed");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Newsletter Subscribers ({subscribers.length})</h2>
      </div>

      {subscribers.length === 0 ? (
        <div className="border border-mist p-12 text-center text-sm text-onyx/50">No subscribers yet.</div>
      ) : (
        <div className="border border-mist overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left">
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Email</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50">Subscribed</th>
                <th className="px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-onyx/50"></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub._id} className="border-b border-mist last:border-0 hover:bg-mist/40">
                  <td className="px-4 py-3 font-medium">{sub.email}</td>
                  <td className="px-4 py-3 text-onyx/60">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(sub._id)}
                      className="text-onyx/40 hover:text-red-700"
                      aria-label={`Remove subscriber ${sub.email}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Shared admin UI pieces
// ------------------------------------------------------------------
const inputCls =
  "w-full border border-mist px-4 py-3 text-sm focus:outline-none focus:border-gold bg-ivory";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] tracking-[0.2em] uppercase text-onyx/70 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-onyx/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 bg-ivory shadow-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-mist sticky top-0 bg-ivory z-10">
          <h3 className="font-display text-lg">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-onyx/50 hover:text-onyx">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-onyx/70 mb-6">{message}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onConfirm} className="btn-luxury !bg-red-800 hover:!bg-red-700">
          Confirm Delete
        </button>
        <button type="button" onClick={onCancel} className="btn-luxury-outline">
          Cancel
        </button>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------
// Site settings tab (CMS) - hero ribbon words, contact and social links
// ------------------------------------------------------------------
function SettingsTab() {
  // The CMS form state mirrors the expanded Setting schema so every
  // storefront section - hero slides, ribbon, contact and Instagram, the
  // whole About page - can be edited from one panel.
  const [settings, setSettings] = useState({
    marqueeWords: [],
    contactEmail: "",
    instagramUrl: "",
    instagramHandle: "",
    heroSlides: [],
    bestSellersImages: [],
    aboutHeroSubtitle: "",
    aboutStoryTitle: "",
    aboutStoryIntro: "",
    aboutStoryBody: "",
    aboutStoryClosing: "",
    aboutAtelierTitle: "",
    aboutValues: [],
  });
  const [loaded, setLoaded] = useState(false);
  const [wordsText, setWordsText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  // Bestsellers slideshow backdrop images (one per featured product card).
  // Recommended size: 1920 x 1080 px (or 1440 x 1000 px), JPG format.
  const [bestsellersImagesText, setBestsellersImagesText] = useState("");
  const [heroSlides, setHeroSlides] = useState([]);
  const [about, setAbout] = useState({
    aboutHeroSubtitle: "",
    aboutStoryTitle: "",
    aboutStoryIntro: "",
    aboutStoryBody: "",
    aboutStoryClosing: "",
    aboutAtelierTitle: "",
    aboutValues: [
      { title: "", text: "" },
      { title: "", text: "" },
      { title: "", text: "" },
      { title: "", text: "" },
    ],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminAPI
      .getSettings()
      .then((res) => {
        if (cancelled) return;
        const s = res.data?.settings || {};
        setSettings(s);
        setWordsText((s.marqueeWords || []).join(", "));
        setContactEmail(s.contactEmail || "");
        setInstagramUrl(s.instagramUrl || "");
        setInstagramHandle(s.instagramHandle || "");
        setBestsellersImagesText((Array.isArray(s.bestSellersImages) ? s.bestSellersImages : []).join(", \n"));
        const savedSlides = Array.isArray(s.heroSlides) ? s.heroSlides : [];
        setHeroSlides(
          savedSlides.length > 0
            ? savedSlides.map((s) => ({ eyebrow: "", headline: "", description: "", cta: "", ctaHref: "", bg: "", ...s }))
            : [{ eyebrow: "", headline: "", description: "", cta: "", ctaHref: "", bg: "" }]
        );
        setAbout({
          aboutHeroSubtitle: s.aboutHeroSubtitle || "",
          aboutStoryTitle: s.aboutStoryTitle || "",
          aboutStoryIntro: s.aboutStoryIntro || "",
          aboutStoryBody: s.aboutStoryBody || "",
          aboutStoryClosing: s.aboutStoryClosing || "",
          aboutAtelierTitle: s.aboutAtelierTitle || "",
          aboutValues: [0, 1, 2, 3].map((i) => (s.aboutValues && s.aboutValues[i]) || { title: "", text: "" }),
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSlide = (index, patch) => {
    setHeroSlides((prev) => prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)));
  };

  const addSlide = () => {
    setHeroSlides((prev) => [...prev, { eyebrow: "", headline: "", description: "", cta: "", ctaHref: "", bg: "" }]);
  };

  const removeSlide = (index) => {
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAboutField = (key, value) => {
    setAbout((prev) => ({ ...prev, [key]: value }));
  };

  const updateAboutValue = (index, patch) => {
    setAbout((prev) => ({
      ...prev,
      aboutValues: prev.aboutValues.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminAPI.updateSettings({
        marqueeWords: wordsText
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
        contactEmail: contactEmail.trim(),
        instagramUrl: instagramUrl.trim(),
        instagramHandle: instagramHandle.trim(),
        bestSellersImages: bestsellersImagesText
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
        heroSlides: heroSlides
          .map((slide) => ({
            eyebrow: slide.eyebrow.trim(),
            bg: slide.bg.trim(),
          }))
          .filter((slide) => slide.bg),
        aboutHeroSubtitle: about.aboutHeroSubtitle.trim(),
        aboutStoryTitle: about.aboutStoryTitle.trim(),
        aboutStoryIntro: about.aboutStoryIntro.trim(),
        aboutStoryBody: about.aboutStoryBody.trim(),
        aboutStoryClosing: about.aboutStoryClosing.trim(),
        aboutAtelierTitle: about.aboutAtelierTitle.trim(),
        aboutValues: about.aboutValues
          .map((v) => ({ title: (v.title || "").trim(), text: (v.text || "").trim() }))
          .filter((v) => v.title || v.text),
      });
      // Signal every open storefront tab that settings changed, so the Home
      // page refreshes its hero ribbon, Instagram block and Bestsellers
      // backdrop images immediately without a manual reload.
      localStorage.setItem("zeal.settingsVersion", String(Date.now()));
      window.dispatchEvent(new Event("zeal-settings-updated"));
      toast.success(
        "Site settings saved. The hero, ribbon, Instagram and About page update instantly on the storefront."
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loaded) {
    return <div className="border border-mist p-10 text-center text-sm text-onyx/50">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl">Site Settings</h2>
        <p className="text-sm text-onyx/60 mt-1">
          Control the content shown across the storefront. Changes appear immediately after saving.
        </p>
      </div>

      <form onSubmit={onSubmit} className="border border-mist p-6 space-y-10">
        {/* ------------------------------------------------------------------
            1. BRAND & CONTACT
        ------------------------------------------------------------------ */}
        <div>
          <h3 className="section-heading-sm font-display text-lg mb-1">Brand &amp; Contact</h3>
          <p className="text-[10px] text-onyx/50 tracking-[0.18em] uppercase mb-4">
            Public details shown in the footer and contact pages.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Email">
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputCls}
                placeholder="hello@zealcollection.com"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className={inputCls}
                placeholder="https://instagram.com/zealcollection"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Instagram Handle (without @)">
              <input
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className={inputCls}
                placeholder="zealcollection"
              />
              <p className="mt-1 text-[10px] text-onyx/50">
                Shown in the Instagram gallery heading on the homepage, e.g. "@zealcollection".
              </p>
            </Field>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            2. HERO SECTION - ribbon words and per-slide text/backgrounds
        ------------------------------------------------------------------ */}
        <div>
          <h3 className="section-heading-sm font-display text-lg mb-1">Homepage Hero</h3>
          <p className="text-[10px] text-onyx/50 tracking-[0.18em] uppercase mb-4">
            The slideshow text, call-to-action buttons and slide background images.
          </p>

          <Field label="Hero Ribbon Words (comma separated)">
            <textarea
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              rows={3}
              placeholder="Timepieces, Leather goods, Night ritual"
              className={`${inputCls} resize-none`}
            />
            <p className="mt-1 text-[10px] text-onyx/50">
              These scroll across the ribbon at the end of the homepage hero section.
            </p>
          </Field>

          <div className="space-y-6 mt-6">
            {heroSlides.map((slide, index) => (
              <div key={`slide-${index}`} className="border border-mist p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="eyebrow">Slide {index + 1}</p>
                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="text-[10px] tracking-[0.2em] uppercase text-red-700/70 hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove slide
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Slide Background Image URL *">
                    <input
                      value={slide.bg}
                      onChange={(e) => updateSlide(index, { bg: e.target.value })}
                      className={inputCls}
                      placeholder="https://res.cloudinary.com/.../slide-1.jpg"
                    />
                  </Field>
                  <Field label="Small Label (optional)">
                    <input
                      value={slide.eyebrow}
                      onChange={(e) => updateSlide(index, { eyebrow: e.target.value })}
                      className={inputCls}
                      placeholder="watches"
                    />
                  </Field>
                </div>
                <p className="text-[10px] text-onyx/50 mt-3">
                  Type the category slug into the label (e.g. "watches", "handbags") and the button becomes "Shop Watches" linking to that category automatically. Leave it empty and the button becomes "Shop Now" pointing to all pieces. The link is fully automatic - nothing else to edit.
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={addSlide}
              className="btn-luxury-outline !px-5 !py-2.5 text-[11px] inline-flex items-center gap-2"
            >
              <Plus size={13} /> Add Slide
            </button>
            <p className="text-[10px] text-onyx/50">
              Images-only hero: each slide needs just a background image URL. Any slide deleted here disappears from the hero the moment you save. The gold button and its link are generated automatically from the label you type, so there is nothing else to configure. Recommended background size: 2560 x 1440 px.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            2b. BEST SELLERS SLIDESHOW IMAGES - backdrop images that fade
            behind each product card in the Bestsellers section. One URL per
            line or comma separated; they cycle in order with the products.
        ------------------------------------------------------------------ */}
        <div>
          <h3 className="section-heading-sm font-display text-lg mb-1">Bestsellers Section</h3>
          <p className="text-[10px] text-onyx/50 tracking-[0.18em] uppercase mb-4">
            Optional backdrop images for the Bestsellers slideshow on the home page. Paste one or more image links; they fade softly behind the product cards.
          </p>

          <div className="space-y-4">
            <Field label="Backdrop Images (one per line or comma separated)">
              <textarea
                value={bestsellersImagesText}
                onChange={(e) => setBestsellersImagesText(e.target.value)}
                rows={4}
                className={`${inputCls} resize-y`}
                placeholder={"https://res.cloudinary.com/.../bestseller-1.jpg,\nhttps://res.cloudinary.com/.../bestseller-2.jpg"}
              />
            </Field>
            <p className="text-[10px] text-onyx/50">
              Recommended image size: 1920 x 1080 px (or 1440 x 1000 px), JPG format, under 600 KB per image for fast loading. The image is shown at 25 % opacity behind the product cards, so a softly textured, dark-toned image looks best. Leaving this empty keeps the section clean with no backdrop.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            3. ABOUT PAGE - hero subtitle, story, values, atelier title
        ------------------------------------------------------------------ */}
        <div>
          <h3 className="section-heading-sm font-display text-lg mb-1">About Page Content</h3>
          <p className="text-[10px] text-onyx/50 tracking-[0.18em] uppercase mb-4">
            Every text block on the About page. Leave a field empty to keep the current wording.
          </p>

          <div className="space-y-4">
            <Field label="Hero Subtitle">
              <input
                value={about.aboutHeroSubtitle}
                onChange={(e) => updateAboutField("aboutHeroSubtitle", e.target.value)}
                className={inputCls}
                placeholder="Born from a reverence for fine craftsmanship..."
              />
            </Field>
            <Field label="Our Heritage - Heading">
              <input
                value={about.aboutStoryTitle}
                onChange={(e) => updateAboutField("aboutStoryTitle", e.target.value)}
                className={inputCls}
                placeholder="Crafted in Silence, Worn with Pride"
              />
            </Field>
            <Field label="Our Heritage - Intro Paragraph">
              <textarea
                value={about.aboutStoryIntro}
                onChange={(e) => updateAboutField("aboutStoryIntro", e.target.value)}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Zealc.ollection began with a simple conviction..."
              />
            </Field>
            <Field label="Our Heritage - Body Paragraph">
              <textarea
                value={about.aboutStoryBody}
                onChange={(e) => updateAboutField("aboutStoryBody", e.target.value)}
                rows={4}
                className={`${inputCls} resize-none`}
                placeholder="From the sourcing of ethically mined materials..."
              />
            </Field>
            <Field label="Our Heritage - Closing Line">
              <input
                value={about.aboutStoryClosing}
                onChange={(e) => updateAboutField("aboutStoryClosing", e.target.value)}
                className={inputCls}
                placeholder="We do not follow seasons. We follow permanence."
              />
            </Field>
          </div>

          <div className="space-y-4 mt-6">
            <p className="eyebrow">Our Values (four cards)</p>
            {about.aboutValues.map((value, index) => (
              <div key={`value-${index}`} className="border border-mist p-5">
                <p className="text-[10px] text-onyx/50 tracking-[0.18em] uppercase mb-3">Value {index + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Title">
                    <input
                      value={value.title}
                      onChange={(e) => updateAboutValue(index, { title: e.target.value })}
                      className={inputCls}
                      placeholder="Uncompromising Quality"
                    />
                  </Field>
                  <Field label="Description">
                    <input
                      value={value.text}
                      onChange={(e) => updateAboutValue(index, { text: e.target.value })}
                      className={inputCls}
                      placeholder="Every piece is inspected against 47 quality checkpoints..."
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Field label="The Atelier - Heading">
              <input
                value={about.aboutAtelierTitle}
                onChange={(e) => updateAboutField("aboutAtelierTitle", e.target.value)}
                className={inputCls}
                placeholder="Where Hours Become Heirlooms"
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-mist">
          <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
            {submitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
