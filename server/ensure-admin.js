// One-time utility: guarantees exactly one admin account with a known password.
// Run from the server folder: node ensure-admin.js
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const User = require("./models/User");

const ADMIN_EMAIL = "admin@zealcollection.com";
const ADMIN_NAME = "Zealc.ollection Administrator";
const ADMIN_PASSWORD = "admin123456";

async function run() {
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
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
