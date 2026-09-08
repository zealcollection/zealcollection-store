// ------------------------------------------------------------------
// DEMO DATA - Used only when the backend is unavailable or while you
// are still uploading images. All image slots are marked CLOUDINARY.
// Replace each CLOUDINARY string with your uploaded image URL.
// Once your backend is live, the API data takes over automatically.
// ------------------------------------------------------------------

// CLOUDINARY: brand/hero/main-hero.jpg
export const DEMO_HERO_IMAGE = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786654145/image_11_enhanced_900x1200_tqp6r4.jpg";

// CLOUDINARY: brand/hero/category-watches.jpg
export const DEMO_CAT_WATCHES_IMAGE = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786653493/image_02_enhanced_900x1200_sb0ess.jpg";
// CLOUDINARY: brand/hero/category-handbags.jpg
export const DEMO_CAT_HANDBAGS_IMAGE = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786654145/image_11_enhanced_900x1200_tqp6r4.jpg";
// CLOUDINARY: brand/hero/category-nightwear.jpg
export const DEMO_CAT_NIGHTWEAR_IMAGE = "";

// CLOUDINARY: banners/brand-story.jpg
export const DEMO_BRAND_STORY_IMAGE = "https://res.cloudinary.com/dglk2inxd/image/upload/v1786659782/daytona_rpbzas.png";

// ------------------------------------------------------------------
// CLOUDINARY: Testimonial portraits - upload to testimonials/
// ------------------------------------------------------------------
export const DEMO_TESTIMONIALS = [
  {
    name: "Alexandra M.",
    role: "London",
    image: "", // CLOUDINARY: testimonials/alexandra.jpg
    text: "The craftsmanship is extraordinary. My Zealc.ollection timepiece has become the centrepiece of every occasion. Impeccable quality, timeless design.",
    rating: 5,
  },
  {
    name: "Dominic R.",
    role: "New York",
    image: "", // CLOUDINARY: testimonials/dominic.jpg
    text: "From the packaging to the product, every detail whispers luxury. The handbag I purchased is simply flawless.",
    rating: 5,
  },
  {
    name: "Isabella C.",
    role: "Milan",
    image: "", // CLOUDINARY: testimonials/isabella.jpg
    text: "I have ordered nightwear from several luxury brands, but nothing compares to the silk quality and the attention to detail at Zealc.ollection.",
    rating: 5,
  },
];

// ------------------------------------------------------------------
// CLOUDINARY: Instagram gallery - upload 6 images to brand/instagram/
// ------------------------------------------------------------------
export const DEMO_INSTAGRAM_IMAGES = [
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883773/ig_6.jpg", // CLOUDINARY: brand/instagram/ig-1.jpg
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883772/ig_5.jpg", // CLOUDINARY: brand/instagram/ig-2.jpg
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883772/ig_4.jpg", // CLOUDINARY: brand/instagram/ig-3.jpg
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883770/ig_1.jpg", // CLOUDINARY: brand/instagram/ig-4.jpg
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883771/ig_2.jpg", // CLOUDINARY: brand/instagram/ig-5.jpg
  "https://res.cloudinary.com/z0afpk9x/image/upload/v1788883771/ig_3.jpg", // CLOUDINARY: brand/instagram/ig-6.jpg
];

// ------------------------------------------------------------------
// Demo categories
// ------------------------------------------------------------------
export const DEMO_CATEGORIES = [
  { _id: "cat-watches", name: "Watches", slug: "watches", image: DEMO_CAT_WATCHES_IMAGE },
  { _id: "cat-handbags", name: "Handbags", slug: "handbags", image: DEMO_CAT_HANDBAGS_IMAGE },
  { _id: "cat-nightwear", name: "Nightwear", slug: "nightwear", image: DEMO_CAT_NIGHTWEAR_IMAGE },
];

// ------------------------------------------------------------------
// Demo products - paste CLOUDINARY URLs into each images array
// ------------------------------------------------------------------
// export const DEMO_PRODUCTS = [
//   {
//     _id: "p1",
//     name: "Royal Chronograph",
//     slug: "royal-chronograph",
//     description: "A statement timepiece with a sapphire crystal face and Italian leather strap.",
//     images: [""], // CLOUDINARY: watches/mens/royal-chronograph.jpg
//     category: { _id: "cat-watches", name: "Watches", slug: "watches" },
//     price: 1290,
//     stock: 12,
//     variants: ["40mm", "42mm"],
//     colors: ["Gold", "Silver"],
//     gender: "men",
//     isNew: true,
//     featured: true,
//   },
//   {
//     _id: "p2",
//     name: "Celeste Automatic",
//     slug: "celeste-automatic",
//     description: "An elegant automatic movement housed in rose gold with mother-of-pearl dial.",
//     images: [""], // CLOUDINARY: watches/ladies/celeste-automatic.jpg
//     category: { _id: "cat-watches", name: "Watches", slug: "watches" },
//     price: 980,
//     stock: 8,
//     variants: ["36mm", "38mm"],
//     colors: ["Rose Gold", "Gold"],
//     gender: "ladies",
//     isNew: false,
//     featured: true,
//   },
//   {
//     _id: "p3",
//     name: "Heritage Leather Tote",
//     slug: "heritage-leather-tote",
//     description: "Full-grain leather tote with gold-plated hardware and suede-lined interior.",
//     images: [""], // CLOUDINARY: handbags/heritage-tote.jpg
//     category: { _id: "cat-handbags", name: "Handbags", slug: "handbags" },
//     price: 740,
//     stock: 15,
//     variants: ["Medium", "Large"],
//     colors: ["Black", "Camel"],
//     gender: "ladies",
//     isNew: true,
//     featured: true,
//   },
//   {
//     _id: "p4",
//     name: "Silk Reverie Gown",
//     slug: "silk-reverie-gown",
//     description: "Pure mulberry silk gown with delicate lace detailing and adjustable straps.",
//     images: [""], // CLOUDINARY: nightwear/silk-reverie-gown.jpg
//     category: { _id: "cat-nightwear", name: "Nightwear", slug: "nightwear" },
//     price: 320,
//     stock: 20,
//     variants: ["S", "M", "L"],
//     colors: ["Ivory", "Midnight"],
//     gender: "ladies",
//     isNew: false,
//     featured: true,
//   },
//   {
//     _id: "p5",
//     name: "Obsidian Minimal",
//     slug: "obsidian-minimal",
//     description: "A study in restraint. Matte black ceramic case with a whisper-thin profile.",
//     images: [""], // CLOUDINARY: watches/mens/obsidian-minimal.jpg
//     category: { _id: "cat-watches", name: "Watches", slug: "watches" },
//     price: 890,
//     stock: 6,
//     variants: ["39mm", "41mm"],
//     colors: ["Black", "Graphite"],
//     gender: "men",
//     isNew: false,
//     featured: true,
//   },
//   {
//     _id: "p6",
//     name: "Petite Chain Clutch",
//     slug: "petite-chain-clutch",
//     description: "Evening clutch in quilted calfskin with a signature gold chain strap.",
//     images: [""], // CLOUDINARY: handbags/petite-chain-clutch.jpg
//     category: { _id: "cat-handbags", name: "Handbags", slug: "handbags" },
//     price: 560,
//     stock: 10,
//     variants: ["One Size"],
//     colors: ["Black", "Gold"],
//     gender: "ladies",
//     isNew: true,
//     featured: true,
//   },
//   {
//     _id: "p7",
//     name: "Moonlight Camisole Set",
//     slug: "moonlight-camisole-set",
//     description: "A two-piece set in lustrous charmeuse with hand-finished seams.",
//     images: [""], // CLOUDINARY: nightwear/moonlight-camisole-set.jpg
//     category: { _id: "cat-nightwear", name: "Nightwear", slug: "nightwear" },
//     price: 260,
//     stock: 18,
//     variants: ["S", "M", "L"],
//     colors: ["Champagne", "Blush"],
//     gender: "ladies",
//     isNew: false,
//     featured: true,
//   },
//   {
//     _id: "p8",
//     name: "Aurelia Diamond Bezel",
//     slug: "aurelia-diamond-bezel",
//     description: "Fifty-two brilliant-cut diamonds frame a pristine white dial.",
//     images: [""], // CLOUDINARY: watches/ladies/aurelia-diamond-bezel.jpg
//     category: { _id: "cat-watches", name: "Watches", slug: "watches" },
//     price: 2450,
//     stock: 4,
//     variants: ["32mm"],
//     colors: ["White Gold"],
//     gender: "ladies",
//     isNew: true,
//     featured: true,
//   },
// ];
