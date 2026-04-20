const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");

console.log("ADMIN ROUTES LOADED");

const auth = require("../middleware/auth");
const Image = require("../models/Image");

// ===== uploads folder =====
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== multer config (memory storage for sharp processing) =====
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limitD
});

// ===== LOGIN ROUTE =====
router.post("/login", (req, res) => {
  try {
    const { key } = req.body;

    if (!key || key !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    const token = jwt.sign(
      { id: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ===== UPLOAD ROUTE (WITH SHARP OPTIMIZATION) =====
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    console.log("---- UPLOAD START ----");
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, category, tags } = req.body;
    const filename = Date.now() + "-" + req.file.originalname.replace(/\s+/g, "-");
    const outputPath = path.join(uploadDir, filename);

    // 🔥 OPTIMIZE WITH SHARP
    await sharp(req.file.buffer)
      .png({ quality: 80, compressionLevel: 9 }) // Optimized PNG lossy compression
      .toFile(outputPath);

    console.log("✅ File Optimized & Saved:", filename);

    const slug =
      (title || "img")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
      "-" +
      Date.now();

    const newImage = new Image({
      title,
      category,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      imageUrl: `/uploads/${filename}`,
      slug,
    });

    await newImage.save();

    res.json({ success: true, data: newImage });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== DELETE ROUTE =====
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete file from uploads folder
    const filePath = path.join(__dirname, "..", image.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Image deleted",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ===== GET ALL IMAGES =====
router.get("/images", async (req, res) => {
  try {
    console.log("GET /images HIT");
    const images = await Image.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: images,
    });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;