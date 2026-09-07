// One-time utility: guarantees exactly one admin account with a known password.
// Run from the server folder: node ensure-admin.js
//
// Requires the following variables to be set in your .env file:
//   SEED_ADMIN_EMAIL
//   SEED_ADMIN_PASSWORD
//   SEED_ADMIN_NAME (optional - defaults to "Zealc.ollection Administrator")
//   MONGO_URI
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const User = require("./models/User");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Zealc.ollection Administrator";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function run() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Missing credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running this script."
    );
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in your .env file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to", mongoose.connection.name);

  // Assign the plain-text password to the model instance; the User schema's
  // pre-save hook hashes it automatically via bcrypt.
  const user = await User.findOne({ email: ADMIN_EMAIL });
  if (user) {
    user.password = ADMIN_PASSWORD;
    user.role = "admin";
    user.name = ADMIN_NAME;
    await user.save();
    console.log("Admin account updated. You can now log in with:");
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log("Admin account created. You can now log in with:");
  }
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log("  Password: (the one set in SEED_ADMIN_PASSWORD)");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});