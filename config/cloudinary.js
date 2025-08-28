// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
<<<<<<< HEAD
const dotenv = require("dotenv");

dotenv.config();

=======
// Environment variables are provided by the platform

// Configure using environment variables for security
>>>>>>> master
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

<<<<<<< HEAD
// Optional, non-sensitive startup log in non-production
if (process.env.NODE_ENV !== "production") {
  const cfg = cloudinary.config();
  console.log("Cloudinary configured:", {
    cloud_name: cfg.cloud_name ? cfg.cloud_name : "NOT SET",
    api_key: cfg.api_key ? "***SET***" : "NOT SET",
    secure: cfg.secure,
  });
=======
// Verify configuration is applied (without logging sensitive data)
const config = cloudinary.config();
console.log("🔧 Cloudinary Configuration Status:");
console.log("   Cloud Name:", config.cloud_name ? "✅ SET" : "❌ NOT SET");
console.log("   API Key:", config.api_key ? "✅ SET" : "❌ NOT SET");
console.log("   API Secret:", config.api_secret ? "✅ SET" : "❌ NOT SET");
console.log("   Secure:", config.secure);

// Test the configuration immediately (only if all credentials are present)
if (config.cloud_name && config.api_key && config.api_secret) {
  (async () => {
    try {
      const pingResult = await cloudinary.api.ping();
      console.log(
        "✅ Cloudinary connection test successful:",
        pingResult.status
      );
    } catch (error) {
      console.error("❌ Cloudinary connection test failed:", error.message);
    }
  })();
} else {
  console.warn(
    "⚠️ Cloudinary credentials incomplete. Please check environment variables."
  );
>>>>>>> master
}

module.exports = cloudinary;
