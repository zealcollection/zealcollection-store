const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

// Subscribe to the newsletter
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address" });
    }

    const emailLower = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: emailLower });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed" });
    }

    await Subscriber.create({ email: emailLower });

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed" });
  }
});

module.exports = router;

// ------------------------------------------------------------------
// Admin: list and remove newsletter subscribers (used by the admin
// Newsletter tab). These endpoints are intentionally open to the
// admin middleware check performed by the admin dashboard client.
// ------------------------------------------------------------------
const { admin } = require("../middleware/auth");

router.get("/subscribers", admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select("email createdAt")
      .sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (error) {
    res.status(500).json({ message: "Could not load subscribers" });
  }
});

router.delete("/subscribers/:id", admin, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscriber removed" });
  } catch (error) {
    res.status(500).json({ message: "Could not remove subscriber" });
  }
});
