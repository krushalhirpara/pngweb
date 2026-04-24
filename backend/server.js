require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
// ✅ CORS: Allow production domain and localhost
app.use(cors({
  origin: ["https://pngwale.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ JSON body parser (REQUIRED for contact form)
app.use(express.json());

// ================= STATIC FILES =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
// ✅ Registering routes properly
app.use("/api/admin", require("./routes/admin"));
app.use("/api", require("./routes/contact"));
app.use("/api", require("./routes")); // General routes last

// ================= IMAGE SITEMAP =================
const Image = require("./models/Image");

app.get("/sitemap.xml", async (req, res) => {
  try {
    const images = await Image.find().sort({ updatedAt: -1 });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>`;

    // Homepage
    xml += `
<url>
  <loc>https://pngwale.com/</loc>
  <changefreq>daily</changefreq>
  <priority>1.0</priority>
</url>`;

    // Image pages
    images.forEach(img => {
      const imageUrl = img.imageUrl.startsWith("http")
        ? img.imageUrl
        : `https://pngwale.com${img.imageUrl}`;

      xml += `
<url>
  <loc>https://pngwale.com/image/${img.slug}</loc>
  <lastmod>${new Date(img.updatedAt).toISOString()}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>

  <image:image>
    <image:loc>${imageUrl}</image:loc>
    <image:title><![CDATA[${img.title}]]></image:title>
    <image:caption><![CDATA[${img.title}]]></image:caption>
  </image:image>
</url>`;
    });

    xml += `</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);

  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("PNGWALE API Running 🚀");
});

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});