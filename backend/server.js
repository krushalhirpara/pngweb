require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/api", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));
// ❌ remove duplicate ./routes if conflict

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.send("PNGWALE API Running 🚀");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ================= DB + SERVER =================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });