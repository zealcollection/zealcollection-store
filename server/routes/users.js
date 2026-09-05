const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// ------------------------------------------------------------------
// Addresses
// ------------------------------------------------------------------
router.get("/addresses", async (req, res) => {
  try {
    const addresses = req.user.addresses || [];
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Could not load addresses" });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: "Please fill in all address fields" });
    }

    const newAddress = {
      label: label || undefined,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: !!isDefault,
    };

    if (isDefault) {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { "addresses.$[addr].isDefault": false } },
        { arrayFilters: [{ "addr.isDefault": true }] }
      );
    }

    req.user.addresses = [...(req.user.addresses || []), newAddress];
    await req.user.save({ validateBeforeSave: false });

    res.status(201).json({ addresses: req.user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save address" });
  }
});

router.put("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Reject obviously invalid ids early to avoid cast errors
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Address not found" });
    }

    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    const idx = (req.user.addresses || []).findIndex(
      (addr) => addr._id && addr._id.toString() === id
    );
    if (idx === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      await User.updateOne(
        { _id: req.user._id },
        { $set: { "addresses.$[addr].isDefault": false } },
        { arrayFilters: [{ "addr.isDefault": true }] }
      );
    }

    req.user.addresses[idx] = {
      ...req.user.addresses[idx].toObject ? req.user.addresses[idx].toObject() : req.user.addresses[idx],
      label: label ?? req.user.addresses[idx].label,
      street: street ?? req.user.addresses[idx].street,
      city: city ?? req.user.addresses[idx].city,
      state: state ?? req.user.addresses[idx].state,
      zipCode: zipCode ?? req.user.addresses[idx].zipCode,
      country: country ?? req.user.addresses[idx].country,
      isDefault: isDefault !== undefined ? !!isDefault : req.user.addresses[idx].isDefault,
    };

    await req.user.save({ validateBeforeSave: false });

    res.json({ addresses: req.user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update address" });
  }
});

router.delete("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Address not found" });
    }

    const addresses = (req.user.addresses || []).filter(
      (addr) => addr._id && addr._id.toString() !== id
    );

    req.user.addresses = addresses;
    await req.user.save({ validateBeforeSave: false });

    res.json({ addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete address" });
  }
});

// ------------------------------------------------------------------
// Profile update (used by the account overview tab)
// ------------------------------------------------------------------
router.put("/profile", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;

    await req.user.save({ validateBeforeSave: false });

    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update profile" });
  }
});

module.exports = router;
