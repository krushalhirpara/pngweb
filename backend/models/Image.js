const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: String,
  slug: {
    type: String,
    unique: true,
  },
  imageUrl: String,
  category: String,
  tags: [String],
}, { timestamps: true });

// 🔥 AUTO GENERATE SLUG
imageSchema.pre("save", async function () {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();
  }
});

module.exports = mongoose.model("Image", imageSchema);