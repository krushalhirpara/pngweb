const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

console.log("SERVER STARTING...");

// ===== ROUTES =====
const adminRoutes = require("./routes/admin");
const imageRoutes = require("./routes"); // ✅ ADD THIS

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILES =====
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== ROUTES =====
app.use("/api/admin", adminRoutes);
app.use("/api", imageRoutes); // ✅ ADD THIS

console.log("👉 ADMIN ROUTES MOUNTED AT /api/admin");
console.log("👉 IMAGE ROUTES MOUNTED AT /api"); // optional log

// ===== TEST =====
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ===== DB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB ERROR:", err));

// ===== START =====
app.listen(5000, () => {
  console.log("Server running on port 5000");
});