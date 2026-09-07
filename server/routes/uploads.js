const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

// ------------------------------------------------------------------
// PRODUCT IMAGE UPLOADS -> Cloudinary
// ------------------------------------------------------------------
// Why this changed: Render's filesystem is EPHEMERAL. Anything saved to
// local disk (the old multer.diskStorage approach) gets wiped on every
// redeploy/restart, so admin-uploaded photos worked locally but vanished
// once hosted. Streaming straight to Cloudinary means "upload from my
// computer" and "paste a Cloudinary link" both end up as the exact same
// kind of permanent, hosted URL in the database - so the CMS works the
// same way either way, on Render or anywhere else.
//
// The response shape is unchanged: { urls: [...] }. The frontend
// (adminAPI.uploadProductImages) needs no changes at all.
//
// REQUIRED ENV VARS (add these in your .env locally AND in Render's
// Environment settings - get them from your Cloudinary Dashboard ->
// Account Details):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ------------------------------------------------------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Files are held in memory only just long enough to stream them to
// Cloudinary - nothing ever touches local disk now.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter: (_req, file, cb) => {
    const ok = /jpe?g|png|gif|webp/i.test(file.originalname) || /^image\//.test(file.mimetype);
    cb(null, ok);
  },
});

// Uploads one file buffer to Cloudinary and resolves with its secure URL.
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "zealcollection/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Only logged-in admins may upload files.
const { protect, admin } = require("../middleware/auth");
router.use(protect, admin);

// Accept up to 100 image files per product upload.
router.post(
  "/product-images",
  upload.array("images", 100),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files received. Please attach at least one image." });
      }
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(500).json({
          message: "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server.",
        });
      }

      const urls = await Promise.all(
        req.files.map((f) => uploadBufferToCloudinary(f.buffer))
      );

      res.json({ urls });
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      res.status(500).json({ message: "Failed to save images" });
    }
  }
);

module.exports = router;