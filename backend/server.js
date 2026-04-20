const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===== DEBUG =====
console.log("SERVER STARTING...");

// ===== ROUTES =====
const adminRoutes = require("./routes/admin");

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILES =====
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== ROUTES =====
app.use("/api/admin", adminRoutes);
console.log("👉 ADMIN ROUTES MOUNTED AT /api/admin");

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