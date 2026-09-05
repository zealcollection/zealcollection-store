const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { sendPasswordReset } = require("../utils/email");

const router = express.Router();

// ------------------------------------------------------------------
// BRUTE-FORCE PROTECTION (in-memory, IP-based)
// Tracks failed logins per IP address. After MAX_FAILED_ATTEMPTS
// failures within WINDOW_MS, the IP is locked out for LOCKOUT_MS.
// This defeats automated password-guessing attacks without blocking
// legitimate customers.
// ------------------------------------------------------------------
const MAX_FAILED_ATTEMPTS = 6;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const failedAttempts = new Map();

// Purge stale entries every minute so the map never grows unbounded
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAttempts.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      failedAttempts.delete(ip);
    } else if (record.attempts.length === 0) {
      failedAttempts.delete(ip);
    } else {
      record.attempts = record.attempts.filter((t) => t > now - WINDOW_MS);
    }
  }
}, 60 * 1000).unref();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown"
  );
}

function checkLoginThrottle(ip) {
  const record = failedAttempts.get(ip) || { attempts: [] };
  const now = Date.now();
  // Active lockout - tell the client how long remains (keeps honest
  // users from retrying endlessly, and gives bots no timing oracle).
  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      blocked: true,
      retryAfter: minutesLeft,
    };
  }
  record.attempts = record.attempts.filter((t) => t > now - WINDOW_MS);
  if (record.attempts.length >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { blocked: true, retryAfter: 15 };
  }
  return { blocked: false };
}

function recordFailedLogin(ip) {
  const record = failedAttempts.get(ip) || { attempts: [] };
  record.attempts.push(Date.now());
  record.lockedUntil = null;
  failedAttempts.set(ip, record);
}

function clearFailedLogins(ip) {
  failedAttempts.delete(ip);
}

// Generate a JWT signed with the user's id
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Register a new customer
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    // Server-side strength rules - clients can be bypassed, so we
    // enforce them here too.
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one letter and one number",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
    });

    res.status(201).json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login - protected by the brute-force guard above
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const ip = getClientIp(req);
    const throttle = checkLoginThrottle(ip);
    if (throttle.blocked) {
      return res.status(429).json({
        message: `Too many failed attempts. Please try again in ${throttle.retryAfter} minute${throttle.retryAfter === 1 ? "" : "s"}.`,
        retryAfterMinutes: throttle.retryAfter,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password || !(await user.matchPassword(password))) {
      recordFailedLogin(ip);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login clears the failed-attempt record for this IP
    clearFailedLogins(ip);

    res.json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// ------------------------------------------------------------------
// GOOGLE OAUTH
// The frontend sends a Google ID token (obtained with Google Sign In
// client library). We verify it server-side with the official
// google-auth-library, then sign in or sign up the user.
// ------------------------------------------------------------------
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google sign-in failed - no credential received" });
    }

    let ticket;
    try {
      const { OAuth2Client } = require("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(401).json({ message: "Google sign-in failed - please try again" });
    }

    const payload = ticket.getPayload();
    const email = (payload.email || "").toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Google sign-in failed - no email from Google" });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] });

    if (user) {
      // Link the Google account to the existing user (first time)
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // New customer - create an account from the Google profile.
      // No password is set; the user can add one later via
      // "Forgot Password", which works for OAuth accounts too.
      const name = payload.name || email.split("@")[0];
      user = await User.create({
        name,
        email,
        googleId: payload.sub,
      });
    }

    res.json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Google sign-in failed" });
  }
});

// ------------------------------------------------------------------
// COMPLETE A PASSWORD RESET (missing piece - the forgot-password
// endpoint only issues the token; this endpoint consumes it).
// ------------------------------------------------------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Your password has been updated. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// Get the signed-in user's profile
router.get("/me", protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      addresses: req.user.addresses,
      createdAt: req.user.createdAt,
    },
  });
});

// Update profile (name and phone)
router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Manage addresses
router.get("/addresses", protect, (req, res) => {
  res.json({ addresses: req.user.addresses });
});

router.post("/addresses", protect, async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country } = req.body;
    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: "Please provide all required address fields" });
    }
    req.user.addresses.push({ label, street, city, state, zipCode, country });
    await req.user.save();
    res.status(201).json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address" });
  }
});

router.put("/addresses/:id", protect, async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country } = req.body;
    const address = req.user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (label !== undefined) address.label = label;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to update address" });
  }
});

router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    req.user.addresses = req.user.addresses.filter(
      (a) => a._id.toString() !== req.params.id
    );
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove address" });
  }
});

// Request a password reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your email address" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Always return 200 so email addresses cannot be enumerated
      return res.json({ message: "If an account exists, a reset link has been sent" });
    }

    // OAuth accounts (created via Google) also reset fine: the new
    // password simply attaches to the existing account.
    user.resetPasswordToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${user.resetPasswordToken}`;
    await sendPasswordReset(user.email, resetUrl);

    res.json({ message: "If an account exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to process request" });
  }
});

module.exports = router;
