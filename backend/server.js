const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded images (IMPORTANT)
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api", require("./routes"));

// ✅ ADD THIS (IMPORTANT - admin upload fix)
app.use("/api/admin", require("./routes/admin"));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});