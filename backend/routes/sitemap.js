const express = require("express");
const router = express.Router();
const Image = require("../models/Image");

router.get("/sitemap.xml", async (req, res) => {
    try {
        const images = await Image.find();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        images.forEach((img) => {
            xml += `
  <url>
    <loc>https://pngwale.com/image/${img.slug}</loc>

    <image:image>
      <image:loc>https://pngwale.com${img.imageUrl}</image:loc>
      <image:title>${img.title}</image:title>
    </image:image>

  </url>`;
        });

        xml += `</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(xml);

    } catch (err) {
        res.status(500).send("Error generating sitemap");
    }
});

module.exports = router;