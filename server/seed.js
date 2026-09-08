// ------------------------------------------------------------------
// Zealc.ollection database seeder
// Populates DEMO categories, products and a demo coupon.
// Run once, on a FRESH/empty database only:  node seed.js --confirm
//
// SAFETY GUARD: this script permanently deletes every existing Product,
// Category and Coupon document before reseeding demo data - there is no
// undo. It used to run that wipe unconditionally the moment the script
// started, with no confirmation of any kind. If it is ever run against a
// database that already has real admin-entered products (for example by
// running `npm run seed` locally while .env's MONGO_URI happens to point
// at the production database, which is an extremely easy mix-up), it
// silently destroys all of that real data and replaces it with these demo
// placeholders. This is very likely what happened before this fix.
//
// To run it now, you must explicitly pass --confirm:
//   node seed.js --confirm
// Without that flag, the script refuses to run and makes no changes.
//
// IMAGE NOTE: Products are seeded with CLOUDINARY placeholder URLs
// that follow the pattern res.cloudinary.com/demo/... so the site
// renders gracefully. Replace each `image:` value with your own
// Cloudinary upload URL, or update the records from the Admin
// dashboard (image fields are fully editable there).
// ------------------------------------------------------------------
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");

const IMG = (keyword) =>
  `https://res.cloudinary.com/demo/image/upload/${keyword}.jpg`;

async function seed() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "\nRefusing to run: this script DELETES every existing product, category and coupon.\n" +
        "Re-run with an explicit confirmation flag once you are certain this is a\n" +
        "database you actually want wiped and reseeded with demo data:\n\n" +
        "    node seed.js --confirm\n"
    );
    process.exit(1);
  }

  await connectDB();
  console.log("Connected to", mongoose.connection.name);

  console.log("Clearing existing data...");
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  // ---- Categories ----
  const watches = await Category.create({
    name: "Watches",
    slug: "watches",
    image: IMG("luxury-watch"),
  });
  const handbags = await Category.create({
    name: "Handbags",
    slug: "handbags",
    image: IMG("luxury-handbag"),
  });
  const apparel = await Category.create({
    name: "Apparel",
    slug: "apparel",
    image: IMG("luxury-coat"),
  });
  const accessories = await Category.create({
    name: "Accessories",
    slug: "accessories",
    image: IMG("luxury-accessories"),
  });
  console.log("Categories seeded");

  // ---- Products ----
  const products = [
    {
      name: "Royal Chronograph",
      description:
        "A masterpiece of horological engineering featuring a sapphire crystal case, automatic Swiss movement and 18-karat gold accents. Water resistant to 100 metres with a 72-hour power reserve.",
      price: 2450,
      stock: 12,
      category: watches,
      variants: ["40mm", "42mm", "44mm"],
      colors: ["Gold", "Silver", "Rose Gold"],
      images: [IMG("luxury-watch-1"), IMG("luxury-watch-2")],
      featured: true,
      isNew: true,
    },
    {
      name: "Midnight Tourbillon",
      description:
        "The crown jewel of our watchmaking atelier. The exposed tourbillon carriage completes a full rotation every 60 seconds, a mesmerizing display of precision visible through the exhibition case back.",
      price: 8900,
      stock: 3,
      category: watches,
      variants: ["42mm"],
      colors: ["Platinum", "Black"],
      images: [IMG("midnight-tourbillon")],
      featured: true,
      isNew: false,
    },
    {
      name: "Heritage Automatic",
      description:
        "Inspired by the golden age of watchmaking, the Heritage Automatic pairs a sunburst dial with a hand-stitched alligator strap for understated elegance.",
      price: 1850,
      stock: 20,
      category: watches,
      variants: ["38mm", "40mm"],
      colors: ["Silver", "Gold"],
      images: [IMG("heritage-automatic")],
      featured: false,
      isNew: true,
    },
    {
      name: "Monaco Leather Tote",
      description:
        "Crafted from full-grain Italian calfskin, the Monaco tote features hand-burnished edges, a suede-lined interior and polished gold hardware. A silhouette that defines effortless sophistication.",
      price: 1690,
      stock: 15,
      category: handbags,
      variants: ["Medium", "Large"],
      colors: ["Noir", "Cognac", "Ivory"],
      images: [IMG("leather-tote")],
      featured: true,
      isNew: true,
    },
    {
      name: "Celeste Evening Clutch",
      description:
        "An heirloom piece featuring hand-set crystals on a silk satin body with a concealed magnetic closure. Includes a detachable gold chain for versatile styling.",
      price: 890,
      stock: 10,
      category: handbags,
      variants: ["One Size"],
      colors: ["Champagne", "Noir"],
      images: [IMG("evening-clutch")],
      featured: false,
      isNew: false,
    },
    {
      name: "Savoy Crossbody",
      description:
        "The everyday essential, reimagined. Structured pebbled leather, an adjustable strap and three interior compartments keep essentials organized in refined style.",
      price: 720,
      stock: 25,
      category: handbags,
      variants: ["Small"],
      colors: ["Taupe", "Noir", "Bordeaux"],
      images: [IMG("savoy-crossbody")],
      featured: false,
      isNew: true,
    },
    {
      name: "Cashmere Overcoat",
      description:
        "Woven from the finest Mongolian cashmere in our Florentine mill, this double-breasted overcoat features horn buttons, a full canvas construction and a satin-lined interior.",
      price: 1950,
      stock: 8,
      category: apparel,
      variants: ["S", "M", "L", "XL"],
      colors: ["Camel", "Charcoal"],
      images: [IMG("cashmere-overcoat")],
      featured: true,
      isNew: false,
    },
    {
      name: "Silk Evening Dress",
      description:
        "Cut from 100% mulberry silk charmeuse with a bias-cut silhouette that drapes like liquid light. Finished by hand in our Paris atelier.",
      price: 1450,
      stock: 6,
      category: apparel,
      variants: ["XS", "S", "M", "L"],
      colors: ["Midnight", "Emerald", "Ivory"],
      images: [IMG("silk-dress")],
      featured: false,
      isNew: true,
    },
    {
      name: "Gold Signet Ring",
      description:
        "A contemporary interpretation of the classic signet, cast in solid 18-karat gold and finished with our signature hand-engraved crest.",
      price: 1250,
      stock: 18,
      category: accessories,
      variants: ["17mm", "19mm", "21mm"],
      colors: ["Gold", "White Gold"],
      images: [IMG("signet-ring")],
      featured: true,
      isNew: false,
    },
    {
      name: "Silk Pocket Square Set",
      description:
        "Three hand-rolled pocket squares in complementary palettes, printed in Como, Italy on 100% silk twill.",
      price: 180,
      stock: 40,
      category: accessories,
      variants: ["Set of 3"],
      colors: ["Assorted"],
      images: [IMG("pocket-squares")],
      featured: false,
      isNew: true,
    },
    {
      name: "Cufflink Collection",
      description:
        "Pairs of hand-finished cufflinks in brushed gold and onyx, presented in a leather-lined presentation case.",
      price: 320,
      stock: 30,
      category: accessories,
      variants: ["One Size"],
      colors: ["Gold / Onyx", "Silver / Mother of Pearl"],
      images: [IMG("cufflinks")],
      featured: false,
      isNew: false,
    },
    {
      name: "Leather Card Holder",
      description:
        "The smallest expression of the Zealc.ollection signature. Five card slots in butter-soft calfskin with contrast edge painting.",
      price: 210,
      stock: 50,
      category: accessories,
      variants: ["One Size"],
      colors: ["Noir", "Cognac"],
      images: [IMG("card-holder")],
      featured: false,
      isNew: false,
    },
  ];

  // Create products one by one so the slug pre-save hook runs
  // (insertMany skips pre-save hooks and left slugs null, breaking the
  // unique slug index)
  for (const p of products) {
    await Product.create(p);
  }
  console.log("Products seeded");

  // ---- Welcome coupon ----
  await Coupon.create({
    code: "Zealc.ollection10",
    discount: 10,
    type: "percentage",
    minOrder: 200,
    active: true,
  });
  console.log("Welcome coupon Zealc.ollection10 seeded");

  // ---- Admin account ----
  // This used to create a SECOND, separate admin account here with a
  // hardcoded email and a weak, publicly-known password
  // (admin@zealcollection.com / admin123456) - a real security risk once
  // committed to source control, and a second admin login that had nothing
  // to do with the one actually configured for this store. Admin account
  // creation now lives in exactly one place: ensure-admin.js, which reads
  // SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from your .env instead of
  // hardcoding credentials in a script.
  console.log("Seeding complete.");
  console.log("To create or reset the admin account, run: node ensure-admin.js");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});