const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Use your existing multer setup (same as admin)
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Note: No need for uploads directory in serverless environment

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Updated routes with optional file upload
router.post("/register", upload.single("faceImage"), authController.register);
router.post("/login", upload.single("faceImage"), authController.login);

module.exports = router;
