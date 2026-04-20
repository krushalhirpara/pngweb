const express = require("express");
const router = express.Router();

// ✅ correct path (IMPORTANT)
const Image = require("./models/Image");

router.get("/images", async (req, res) => {
  try {
    console.log("👉 Fetching images...");

    const images = await Image.find();

    console.log("👉 Found:", images.length);

    res.json({ success: true, data: images });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
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