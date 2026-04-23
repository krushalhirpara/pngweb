const express = require("express");
const router = express.Router();

// ✅ correct path (IMPORTANT)
const Image = require("./models/Image");

router.get("/images", async (req, res) => {
  try {
    console.log("👉 Fetching images...");

    const images = await Image.find().sort({ createdAt: -1 });

    const data = images.map(img => {
      // Ensure absolute URL for frontend
      const imageUrl = img.imageUrl.startsWith("http")
        ? img.imageUrl
        : `https://pngweb-production.up.railway.app${img.imageUrl}`;
      
      return {
        ...img.toObject(),
        imageUrl
      };
    });

    console.log("👉 Found:", data.length);

    res.json({ success: true, data: data });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/image/:slug", async (req, res) => {
  try {
    const image = await Image.findOne({ slug: req.params.slug });

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.json({ success: true, data: image });
  } catch (err) {
    console.error("DETAIL FETCH ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;