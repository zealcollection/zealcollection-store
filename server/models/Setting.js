const mongoose = require("mongoose");
// Single-document site settings used by the admin CMS. Editable values cover
// the hero section slides, the about page content, brand identity, contact
// details and social links used across the storefront.
const settingSchema = new mongoose.Schema(
  {
    // Hero ribbon scrolling words, e.g. ["Timepieces", "Leather goods", "Night ritual"]
    marqueeWords: [{ type: String, trim: true }],
    brandName: { type: String, default: "Zealc.ollection" },
    contactEmail: { type: String, default: "hello@zealcollection.com" },
    instagramUrl: { type: String, default: "https://instagram.com/zealcollection" },
    instagramHandle: { type: String, default: "zealcollection" },
    announcement: { type: String, default: "" },
    // Hero slideshow slides. Each slide may carry an override for the
    // eyebrow, headline, description, CTA label, CTA link and background.
    heroSlides: [
      {
        number: { type: String, default: "" },
        eyebrow: { type: String, default: "" },
        headline: { type: String, default: "" },
        description: { type: String, default: "" },
        cta: { type: String, default: "" },
        ctaHref: { type: String, default: "" },
        bg: { type: String, default: "" },
      },
    ],
    heroSubtitle: { type: String, default: "" },
    // About page story section (heritage)
    aboutStoryTitle: { type: String, default: "" },
    aboutStoryIntro: { type: String, default: "" },
    aboutStoryBody: { type: String, default: "" },
    aboutStoryClosing: { type: String, default: "" },
    // About page values grid
    aboutValues: [
      {
        title: { type: String, default: "" },
        text: { type: String, default: "" },
      },
    ],
    // About page atelier section
    aboutAtelierTitle: { type: String, default: "" },
    // About page hero
    aboutHeroSubtitle: { type: String, default: "" },
    // Bestsellers slideshow backdrop images (displayed behind the products
    // of the Bestsellers section, one per featured product, in order)
    bestSellersImages: [{ type: String, trim: true }],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Setting", settingSchema);
