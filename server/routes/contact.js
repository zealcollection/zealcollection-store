// ------------------------------------------------------------------
// Contact form route
// Handles POST /api/contact - saves the message and emails a
// notification using the SMTP credentials configured in .env
// ------------------------------------------------------------------
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const router = express.Router();

// Schema is defined inline so this file has no dependency on your
// existing models folder. Move it into models/Contact.js later if
// you want it alongside your other schemas.
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: true }
);

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

// Reuses the SMTP_* variables already in your .env. If they're not
// set, the route still saves the message - it just skips the email.
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Hard caps so a slow/blocked SMTP connection can never hang a
    // request indefinitely - without these, nodemailer has no
    // default timeout on some hosts.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
}

function notifyByEmail({ name, email, subject, message }) {
  if (!transporter) return;
  // Deliberately not awaited by the caller - the DB write already
  // succeeded, so a slow or failing email must not delay or fail
  // the response the user is waiting on.
  transporter
    .sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New contact form message: ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    })
    .catch((mailError) => {
      console.error("Contact email notification failed:", mailError.message);
    });
}

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const contact = await Contact.create({ name, email, subject, message });

    // Fire-and-forget: response goes out as soon as the message is saved.
    notifyByEmail({ name, email, subject, message });

    return res.status(201).json({
      message: "Your message has been received",
      id: contact._id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ message: "Could not send your message" });
  }
});

module.exports = router;