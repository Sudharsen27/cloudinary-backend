require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Multer setup (save temporarily before upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "my_uploads", // optional folder
    });

    // Delete local file
    fs.unlinkSync(filePath);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Delete route
app.delete("/delete/:public_id", async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.public_id);
    res.json({ message: "Deleted successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Cloudinary Sample Node App Running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);



