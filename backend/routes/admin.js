const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const xlsx = require("xlsx");
const axios = require("axios");

console.log("ADMIN ROUTES LOADED");

const auth = require("../middleware/auth");
const Image = require("../models/Image");

// ===== uploads folder =====
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== multer config (memory storage for processing) =====
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Utility to download image from URL
async function downloadImage(url, dest) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(dest);
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// ===== LOGIN ROUTE =====
router.post("/login", (req, res) => {
  try {
    const { key, secretKey } = req.body;
    const providedKey = key || secretKey;

    if (!providedKey || providedKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    const token = jwt.sign(
      { id: "admin" },
      process.env.JWT_SECRET || "fallback_secret",
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
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, category, tags } = req.body;
    const filename = Date.now() + "-" + req.file.originalname.replace(/\s+/g, "-");
    const outputPath = path.join(uploadDir, filename);

    // 🔥 OPTIMIZE WITH SHARP
    await sharp(req.file.buffer)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);

    const slug = (title || "img").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

    const newImage = new Image({
      title,
      category: category === "All" ? "Vector" : category,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      imageUrl: `/uploads/${filename}`,
      slug,
    });

    await newImage.save();
    res.json({ success: true, data: newImage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== BULK UPLOAD VIA EXCEL =====
router.post("/bulk-upload", auth, upload.single("excel"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No Excel file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    
    // ✅ Normalize Rows (Trim headers, convert to lowercase)
    const rows = rawRows.map(row => {
      const normalized = {};
      Object.keys(row).forEach(k => {
        const cleanKey = k.trim().toLowerCase();
        normalized[cleanKey] = row[k];
      });
      return normalized;
    }).filter(row => Object.values(row).some(v => v !== "")); // Skip truly empty rows

    let successCount = 0;
    let failedCount = 0;
    const failedRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const { image_url, title, category, tags } = row;

      // ✅ Validation
      const missingFields = [];
      if (!image_url) missingFields.push("image_url");
      if (!category) missingFields.push("category");
      if (!title) missingFields.push("title");

      if (missingFields.length > 0) {
        failedCount++;
        failedRows.push({ 
          row: i + 2, 
          reason: `Missing required fields: ${missingFields.join(", ")}` 
        });
        continue;
      }

      // ✅ URL Validation
      try {
        new URL(image_url);
      } catch (e) {
        failedCount++;
        failedRows.push({ row: i + 2, reason: "Invalid image_url format (must be a full URL)" });
        continue;
      }

      try {
        // Generate unique filename
        const urlObj = new URL(image_url);
        const ext = path.extname(urlObj.pathname) || '.png';
        const filename = `bulk-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
        const dest = path.join(uploadDir, filename);

        // Download image
        await downloadImage(image_url, dest);

        // Create DB entry
        const cleanTitle = String(title).trim();
        const slug = cleanTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
        const tagArray = tags ? String(tags).split(",").map(t => t.trim()) : [];

        const newImage = new Image({
          title: cleanTitle,
          category: String(category).trim(),
          tags: tagArray,
          imageUrl: `/uploads/${filename}`,
          slug,
        });

        await newImage.save();
        successCount++;
      } catch (err) {
        console.error(`Row ${i + 2} error:`, err.message);
        failedCount++;
        failedRows.push({ row: i + 2, reason: `Processing failed: ${err.message}` });
      }
    }

    res.json({
      success: true,
      summary: {
        total: rows.length,
        success: successCount,
        failed: failedCount,
        failedRows
      }
    });

  } catch (err) {
    console.error("BULK UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== UPDATE ROUTE =====
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { title, category, tags } = req.body;
    const image = await Image.findById(req.params.id);

    if (!image) return res.status(404).json({ success: false, message: "Image not found" });

    if (title) image.title = title;
    if (category) image.category = category;
    if (tags) {
      image.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim());
    }

    if (title && title !== image.title) {
      image.slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    }

    await image.save();
    res.json({ success: true, message: "Image updated successfully", data: image });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== DELETE ROUTE =====
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: "Image not found" });

    const filePath = path.join(__dirname, "..", image.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== GET ALL IMAGES =====
router.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    const data = images.map(img => ({
      ...img.toObject(),
      imageUrl: img.imageUrl.startsWith("http") ? img.imageUrl : `https://pngweb-production.up.railway.app${img.imageUrl}`
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;