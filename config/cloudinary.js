// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Optional, non-sensitive startup log in non-production
if (process.env.NODE_ENV !== "production") {
  const cfg = cloudinary.config();
  console.log("Cloudinary configured:", {
    cloud_name: cfg.cloud_name ? cfg.cloud_name : "NOT SET",
    api_key: cfg.api_key ? "***SET***" : "NOT SET",
    secure: cfg.secure,
  });
}

module.exports = cloudinary;
