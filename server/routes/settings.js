const express = require("express");
const router = express.Router();
// Public read-only endpoint: the storefront (hero ribbon, slides, about
// copy, footer links) reads these values without authentication.
router.get("/", async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    const settings = await Setting.findOne();
    res.json({
      settings: {
        marqueeWords: settings?.marqueeWords || [],
        brandName: settings?.brandName || "Zealc.ollection",
        contactEmail: settings?.contactEmail || "",
        instagramUrl: settings?.instagramUrl || "",
        instagramHandle: settings?.instagramHandle || "zealcollection",
        announcement: settings?.announcement || "",
        heroSlides: settings?.heroSlides || [],
        heroSubtitle: settings?.heroSubtitle || "",
        aboutStoryTitle: settings?.aboutStoryTitle || "",
        aboutStoryIntro: settings?.aboutStoryIntro || "",
        aboutStoryBody: settings?.aboutStoryBody || "",
        aboutStoryClosing: settings?.aboutStoryClosing || "",
        aboutValues: settings?.aboutValues || [],
        aboutAtelierTitle: settings?.aboutAtelierTitle || "",
        aboutHeroSubtitle: settings?.aboutHeroSubtitle || "",
        bestSellersImages: settings?.bestSellersImages || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});
module.exports = router;
