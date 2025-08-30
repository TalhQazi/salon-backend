require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AdvanceSalary = require("../models/AdvanceSalary");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
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

const handleFileUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    }
    next();
  });
};

// ===== Employee adds advance salary request =====
exports.addAdvanceSalary = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "employee-advance-salary",
      resource_type: "auto",
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Create advance salary record with pending status
    const advanceSalary = new AdvanceSalary({
      employeeId: req.user._id,
      employeeName: req.user.name,
      employeeLivePicture:
        req.user.profilePicture ||
        "https://via.placeholder.com/300x300?text=Employee",
      amount: parseFloat(amount),
      image: result.secure_url,
      submittedBy: req.user._id,
      submittedByName: req.user.name,
      status: "pending", // Employee request must be approved by admin
      adminNotes: "",
    });

    await advanceSalary.save();

    res.status(201).json({
      message: "Advance salary request submitted successfully",
      advanceSalary: {
        id: advanceSalary._id,
        amount: advanceSalary.amount,
        image: advanceSalary.image,
        status: advanceSalary.status,
        createdAt: advanceSalary.createdAt,
      },
    });
  } catch (err) {
    console.error("Add Advance Salary Error:", err);
    res.status(500).json({
      message: "Error submitting advance salary request",
      error: err.message,
    });
  }
};

// ===== Get All Advance Salary Records for Employee =====
exports.getAllAdvanceSalary = async (req, res) => {
  try {
    const records = await AdvanceSalary.find(
      { employeeId: req.user._id },
      "amount image status createdAt"
    ).sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (err) {
    console.error("Get All Advance Salary Error:", err);
    res.status(500).json({
      message: "Error fetching advance salary records",
      error: err.message,
    });
  }
};

// ===== Get Advance Salary by ID for Employee =====
exports.getAdvanceSalaryById = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await AdvanceSalary.findOne(
      { _id: recordId, employeeId: req.user._id },
      "amount image status createdAt"
    );

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (err) {
    console.error("Get Advance Salary by ID Error:", err);
    res.status(500).json({
      message: "Error fetching advance salary record",
      error: err.message,
    });
  }
};

// Export middleware
exports.handleFileUpload = handleFileUpload;
