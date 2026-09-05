const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// ------------------------------------------------------------------
// LOCAL IMAGE UPLOADS (no Cloudinary needed)
// ------------------------------------------------------------------
// Why: the admin can simply pick image files from their computer when
// creating or editing a product. Files are saved to server/uploads/
// and served from the same domain, so the storefront reads normal
// URLs like /uploads/products/<file>.jpg.
//
// Size guidance: the multer limits below cap one upload at 8 MB and
// up to 100 images per product upload. Recommended practice for web
// images: JPG/PNG/WEBP resized to about 1200 x 1600 px (under ~500 KB
// each). See README_UPLOADS.md for storage math.
// ------------------------------------------------------------------

const UPLOAD_DIR = path.join(__dirname, "../uploads/products");

// Keep the upload directory ready even before any file arrives.
const fs = require("fs");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Extension from the mime type, never from the original filename -
    // avoids doubled extensions like "watch.jpg.jpg".
    const mimeExt = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    }[file.mimetype] || ".jpg";
    const base = file.originalname
      .replace(path.extname(file.originalname), "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(0, 60)
      .replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${mimeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter: (_req, file, cb) => {
    const ok = /jpe?g|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
});

// Only logged-in admins may upload files.
const { protect, admin } = require("../middleware/auth");
router.use(protect, admin);

// Accept up to 100 image files per product upload.
router.post(
  "/product-images",
  upload.array("images", 100),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files received. Please attach at least one image." });
      }
      const urls = req.files.map((f) => `/uploads/products/${f.filename}`);
      res.json({ urls });
    } catch (err) {
      res.status(500).json({ message: "Failed to save images" });
    }
  }
);

module.exports = router;
