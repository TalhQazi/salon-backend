<<<<<<< HEAD
require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const ManualAttendanceRequest = require('../models/ManualAttendanceRequest');

// Cloudinary configured globally via config/cloudinary

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
=======
require("dotenv").config();
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const ManualAttendanceRequest = require("../models/ManualAttendanceRequest");

// Use os.tmpdir() for temporary files (better for serverless)
const uploadsDir = os.tmpdir();
>>>>>>> master

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
<<<<<<< HEAD
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const handleFileUpload = (req, res, next) => {
  upload.single('livePicture')(req, res, (err) => {
    if (err) {
      console.error('Multer Error:', err);
      return res.status(400).json({
        message: 'File upload error',
        error: err.message,
      });
    }
    console.log('📋 Parsed body:', req.body);
    console.log('📁 File:', req.file);
=======
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

const handleFileUpload = (req, res, next) => {
  upload.single("livePicture")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);

      // Handle specific file size error
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size too large",
          error: "File size should be less than 50MB",
        });
      }

      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    }
    console.log("📋 Parsed body:", req.body);
    console.log("📁 File:", req.file);

    // Check if file was uploaded successfully
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded or file upload failed",
        error: "File not found in request",
      });
    }

    // Verify file exists
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({
        message: "Uploaded file not found on server",
        error: `File path: ${req.file.path} does not exist`,
      });
    }

    // Check file size (additional validation)
    const fileSizeInMB = req.file.size / (1024 * 1024);
    console.log(`📏 File size: ${fileSizeInMB.toFixed(2)} MB`);

    if (fileSizeInMB > 50) {
      // Clean up the file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.log(
          "⚠️ Could not cleanup oversized file:",
          cleanupError.message
        );
      }

      return res.status(400).json({
        message: "File size too large",
        error: "File size should be less than 50MB",
      });
    }

>>>>>>> master
    next();
  });
};

// AWS Face Recognition Integration for Employee Attendance
<<<<<<< HEAD
const { enhancedFaceComparison, validateImageForFaceRecognition, cleanupTempImage } = require('../utils/imageUtils');
=======
const {
  enhancedFaceComparison,
  validateImageForFaceRecognition,
  cleanupTempImage,
} = require("../utils/imageUtils");
>>>>>>> master

// Face verification function using AWS Rekognition
async function verifyEmployeeFace(storedImageUrl, attendanceImagePath) {
  try {
<<<<<<< HEAD
    console.log('🔍 Starting employee face verification for attendance...');
    
    // Validate attendance image quality
    const imageValidation = validateImageForFaceRecognition(attendanceImagePath);
    if (!imageValidation.valid) {
      console.log('❌ Image validation failed:', imageValidation.message);
      return {
        success: false,
        message: imageValidation.message,
        error: imageValidation.error
      };
    }
    
    // Download stored image from Cloudinary for comparison
    // For now, we'll use the stored image URL directly
    // In production, you might want to download the image first
    
=======
    console.log("🔍 Starting employee face verification for attendance...");
    console.log("📁 Attendance image path:", attendanceImagePath);

    // Check if file exists
    if (!fs.existsSync(attendanceImagePath)) {
      console.log("❌ Attendance image file not found:", attendanceImagePath);
      return {
        success: false,
        message: "Attendance image file not found",
        error: `File not found: ${attendanceImagePath}`,
      };
    }

    // Validate attendance image quality
    const imageValidation =
      validateImageForFaceRecognition(attendanceImagePath);
    if (!imageValidation.valid) {
      console.log("❌ Image validation failed:", imageValidation.message);
      return {
        success: false,
        message: imageValidation.message,
        error: imageValidation.error,
      };
    }

    // Download stored image from Cloudinary for comparison
    // For now, we'll use the stored image URL directly
    // In production, you might want to download the image first

>>>>>>> master
    // Perform enhanced face comparison
    const faceComparison = await enhancedFaceComparison(
      storedImageUrl, // Stored employee image
      attendanceImagePath // Current attendance image
    );
<<<<<<< HEAD
    
    if (faceComparison.success && faceComparison.isMatch) {
      console.log(`✅ Employee face verification successful! Similarity: ${faceComparison.similarity}%, Confidence: ${faceComparison.confidence}`);
      return {
        success: true,
        similarity: faceComparison.similarity,
        message: faceComparison.message
      };
    } else {
      console.log(`❌ Employee face verification failed. Similarity: ${faceComparison.similarity}%`);
=======

    if (faceComparison.success && faceComparison.isMatch) {
      console.log(
        `✅ Employee face verification successful! Similarity: ${faceComparison.similarity}%, Confidence: ${faceComparison.confidence}`
      );
      return {
        success: true,
        similarity: faceComparison.similarity,
        message: faceComparison.message,
      };
    } else {
      console.log(
        `❌ Employee face verification failed. Similarity: ${faceComparison.similarity}%`
      );
>>>>>>> master
      return {
        success: false,
        similarity: faceComparison.similarity,
        message: faceComparison.message,
<<<<<<< HEAD
        error: faceComparison.error
      };
    }
    
  } catch (error) {
    console.error('❌ Face verification error:', error);
    return {
      success: false,
      similarity: 0,
      message: 'Face verification process failed',
      error: error.message
=======
        error: faceComparison.error,
      };
    }
  } catch (error) {
    console.error("❌ Face verification error:", error);
    return {
      success: false,
      similarity: 0,
      message: "Face verification process failed",
      error: error.message,
>>>>>>> master
    };
  }
}

// Employee Check-In
exports.employeeCheckIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Employee ID is required'
=======
        message: "Employee ID is required",
>>>>>>> master
      });
    }

    if (!req.file) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Live picture is required for check-in'
      });
    }

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Verify face using AWS Rekognition BEFORE deleting local file
    const faceVerification = await verifyEmployeeFace(employee.livePicture, req.file.path);
    if (!faceVerification.success) {
      // Clean up temporary image
      cleanupTempImage(req.file.path);
      
      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error
      });
    }
    
    console.log(`✅ Face verification successful! Similarity: ${faceVerification.similarity}%`);
    
    // Upload attendance image to Cloudinary and then cleanup
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'attendance',
      resource_type: 'auto'
    });
    cleanupTempImage(req.file.path);
=======
        message: "Live picture is required for check-in",
      });
    }

    // Find employee by employeeId (string field)
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Verify face using AWS Rekognition (before uploading to Cloudinary)
    console.log("🔍 Starting face verification...");
    const faceVerification = await verifyEmployeeFace(
      employee.livePicture,
      req.file.path
    );

    if (!faceVerification.success) {
      // Clean up temporary image
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log("🗑️ Cleaned up temp file after failed verification");
        }
      } catch (cleanupError) {
        console.log("⚠️ Could not cleanup temp file:", cleanupError.message);
      }

      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error,
      });
    }

    console.log(
      `✅ Face verification successful! Similarity: ${faceVerification.similarity}%`
    );

    // Upload attendance image to Cloudinary
    console.log("☁️ Uploading to Cloudinary:", req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "attendance",
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    // Delete local file after successful upload
    try {
      fs.unlinkSync(req.file.path);
      console.log("🗑️ Local file deleted:", req.file.path);
    } catch (deleteError) {
      console.log("⚠️ Could not delete local file:", deleteError.message);
    }
>>>>>>> master

    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
<<<<<<< HEAD
    
    let attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
=======

    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
>>>>>>> master
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Check-in already recorded for today'
=======
        message: "Check-in already recorded for today",
>>>>>>> master
      });
    }

    // Create or update attendance
    if (!attendance) {
      attendance = new Attendance({
<<<<<<< HEAD
        employeeId: employeeId,
=======
        employeeId: employee._id,
>>>>>>> master
        employeeName: employee.name,
        date: today,
        checkInTime: new Date(),
        checkInImage: result.secure_url,
<<<<<<< HEAD
        status: 'present'
=======
        status: "present",
>>>>>>> master
      });
    } else {
      attendance.checkInTime = new Date();
      attendance.checkInImage = result.secure_url;
<<<<<<< HEAD
      attendance.status = 'present';
=======
      attendance.status = "present";
>>>>>>> master
    }

    await attendance.save();

    res.status(200).json({
<<<<<<< HEAD
      message: 'Check-in successful',
=======
      message: "Check-in successful",
>>>>>>> master
      attendance: {
        id: attendance._id,
        employeeName: attendance.employeeName,
        checkInTime: attendance.checkInTime,
<<<<<<< HEAD
        status: attendance.status
      }
    });
  } catch (err) {
    console.error('Check-In Error:', err);
    res.status(500).json({
      message: 'Error during check-in',
      error: err.message
=======
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("Check-In Error:", err);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("🗑️ Cleaned up temp file after error");
      } catch (cleanupError) {
        console.log("⚠️ Could not cleanup temp file:", cleanupError.message);
      }
    }

    res.status(500).json({
      message: "Error during check-in",
      error: err.message,
>>>>>>> master
    });
  }
};

// Employee Check-Out
exports.employeeCheckOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Employee ID is required'
=======
        message: "Employee ID is required",
>>>>>>> master
      });
    }

    if (!req.file) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Live picture is required for check-out'
      });
    }

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Verify face using AWS Rekognition BEFORE deleting local file
    const faceVerification = await verifyEmployeeFace(employee.livePicture, req.file.path);
    if (!faceVerification.success) {
      // Clean up temporary image
      cleanupTempImage(req.file.path);
      
      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error
      });
    }
    
    console.log(`✅ Face verification successful! Similarity: ${faceVerification.similarity}%`);
    
    // Upload attendance image to Cloudinary and then cleanup
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'attendance',
      resource_type: 'auto'
    });
    cleanupTempImage(req.file.path);
=======
        message: "Live picture is required for check-out",
      });
    }

    // Find employee by employeeId (string field)
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Verify face using AWS Rekognition (before uploading to Cloudinary)
    console.log("🔍 Starting face verification...");
    const faceVerification = await verifyEmployeeFace(
      employee.livePicture,
      req.file.path
    );

    if (!faceVerification.success) {
      // Clean up temporary image
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log("🗑️ Cleaned up temp file after failed verification");
        }
      } catch (cleanupError) {
        console.log("⚠️ Could not cleanup temp file:", cleanupError.message);
      }

      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error,
      });
    }

    console.log(
      `✅ Face verification successful! Similarity: ${faceVerification.similarity}%`
    );

    // Upload attendance image to Cloudinary
    console.log("☁️ Uploading to Cloudinary:", req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "attendance",
      resource_type: "auto",
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    // Delete local file after successful upload
    try {
      fs.unlinkSync(req.file.path);
      console.log("🗑️ Local file deleted:", req.file.path);
    } catch (deleteError) {
      console.log("⚠️ Could not delete local file:", deleteError.message);
    }
>>>>>>> master

    // Find today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
<<<<<<< HEAD
    
    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
=======

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
>>>>>>> master
    });

    if (!attendance) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'No check-in record found for today'
=======
        message: "No check-in record found for today",
>>>>>>> master
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
<<<<<<< HEAD
        message: 'Check-out already recorded for today'
=======
        message: "Check-out already recorded for today",
>>>>>>> master
      });
    }

    // Update attendance with check-out
    attendance.checkOutTime = new Date();
    attendance.checkOutImage = result.secure_url;
    attendance.updatedAt = new Date();

    await attendance.save();

    res.status(200).json({
<<<<<<< HEAD
      message: 'Check-out successful',
=======
      message: "Check-out successful",
>>>>>>> master
      attendance: {
        id: attendance._id,
        employeeName: attendance.employeeName,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
<<<<<<< HEAD
        status: attendance.status
      }
    });
  } catch (err) {
    console.error('Check-Out Error:', err);
    res.status(500).json({
      message: 'Error during check-out',
      error: err.message
=======
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("Check-Out Error:", err);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("🗑️ Cleaned up temp file after error");
      } catch (cleanupError) {
        console.log("⚠️ Could not cleanup temp file:", cleanupError.message);
      }
    }

    res.status(500).json({
      message: "Error during check-out",
      error: err.message,
>>>>>>> master
    });
  }
};

// Manual Attendance Request
exports.manualAttendanceRequest = async (req, res) => {
  try {
<<<<<<< HEAD
    const { employeeId, employeeName, requestType, requestedTime, note } = req.body;

    if (!employeeId || !employeeName || !requestType || !requestedTime || !note) {
      return res.status(400).json({
        message: 'All fields are required: employeeId, employeeName, requestType, requestedTime, note'
=======
    const { employeeId, employeeName, requestType, requestedTime, note } =
      req.body;

    if (
      !employeeId ||
      !employeeName ||
      !requestType ||
      !requestedTime ||
      !note
    ) {
      return res.status(400).json({
        message:
          "All fields are required: employeeId, employeeName, requestType, requestedTime, note",
>>>>>>> master
      });
    }

    // Validate request type
<<<<<<< HEAD
    if (!['checkin', 'checkout'].includes(requestType)) {
      return res.status(400).json({
        message: 'Request type must be either checkin or checkout'
=======
    if (!["checkin", "checkout"].includes(requestType)) {
      return res.status(400).json({
        message: "Request type must be either checkin or checkout",
>>>>>>> master
      });
    }

    // Check if employee exists
<<<<<<< HEAD
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
=======
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
>>>>>>> master
      });
    }

    // Create manual attendance request
    const manualRequest = new ManualAttendanceRequest({
<<<<<<< HEAD
      employeeId,
      employeeName,
      requestType,
      requestedTime,
      note
=======
      employeeId: employee._id,
      employeeName,
      requestType,
      requestedTime,
      note,
>>>>>>> master
    });

    await manualRequest.save();

    res.status(201).json({
<<<<<<< HEAD
      message: 'Manual attendance request submitted successfully',
=======
      message: "Manual attendance request submitted successfully",
>>>>>>> master
      request: {
        id: manualRequest._id,
        employeeName: manualRequest.employeeName,
        requestType: manualRequest.requestType,
        requestedTime: manualRequest.requestedTime,
<<<<<<< HEAD
        status: manualRequest.status
      }
    });
  } catch (err) {
    console.error('Manual Attendance Request Error:', err);
    res.status(500).json({
      message: 'Error submitting manual attendance request',
      error: err.message
=======
        status: manualRequest.status,
      },
    });
  } catch (err) {
    console.error("Manual Attendance Request Error:", err);
    res.status(500).json({
      message: "Error submitting manual attendance request",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get Pending Manual Requests (Admin)
exports.getPendingManualRequests = async (req, res) => {
  try {
<<<<<<< HEAD
    const pendingRequests = await ManualAttendanceRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 });

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error('Get Pending Requests Error:', err);
    res.status(500).json({
      message: 'Error fetching pending requests',
      error: err.message
=======
    const pendingRequests = await ManualAttendanceRequest.find({
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error("Get Pending Requests Error:", err);
    res.status(500).json({
      message: "Error fetching pending requests",
      error: err.message,
>>>>>>> master
    });
  }
};

// Approve/Decline Manual Request (Admin)
exports.approveDeclineManualRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

<<<<<<< HEAD
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either approved or declined'
=======
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either approved or declined",
>>>>>>> master
      });
    }

    const request = await ManualAttendanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
<<<<<<< HEAD
        message: 'Manual attendance request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        message: 'This request has already been processed'
=======
        message: "Manual attendance request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been processed",
>>>>>>> master
      });
    }

    // Update request status
    request.status = status;
<<<<<<< HEAD
    request.adminNotes = adminNotes || '';
=======
    request.adminNotes = adminNotes || "";
>>>>>>> master
    request.updatedAt = new Date();

    await request.save();

    // If approved, create or update attendance record
<<<<<<< HEAD
    if (status === 'approved') {
=======
    if (status === "approved") {
>>>>>>> master
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let attendance = await Attendance.findOne({
        employeeId: request.employeeId,
        date: {
          $gte: today,
<<<<<<< HEAD
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
=======
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
>>>>>>> master
      });

      if (!attendance) {
        attendance = new Attendance({
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          date: today,
<<<<<<< HEAD
          status: 'present',
=======
          status: "present",
>>>>>>> master
          isManualRequest: true,
          manualRequestData: {
            requestType: request.requestType,
            requestedTime: request.requestedTime,
            note: request.note,
<<<<<<< HEAD
            status: 'approved',
            adminNotes: adminNotes
          }
=======
            status: "approved",
            adminNotes: adminNotes,
          },
>>>>>>> master
        });
      } else {
        attendance.isManualRequest = true;
        attendance.manualRequestData = {
          requestType: request.requestType,
          requestedTime: request.requestedTime,
          note: request.note,
<<<<<<< HEAD
          status: 'approved',
          adminNotes: adminNotes
=======
          status: "approved",
          adminNotes: adminNotes,
>>>>>>> master
        };
      }

      // Set check-in or check-out time based on request type
<<<<<<< HEAD
      if (request.requestType === 'checkin') {
        attendance.checkInTime = new Date(request.requestedTime);
      } else if (request.requestType === 'checkout') {
=======
      if (request.requestType === "checkin") {
        attendance.checkInTime = new Date(request.requestedTime);
      } else if (request.requestType === "checkout") {
>>>>>>> master
        attendance.checkOutTime = new Date(request.requestedTime);
      }

      await attendance.save();
    }

    res.status(200).json({
      message: `Manual attendance request ${status} successfully`,
      request: {
        id: request._id,
        employeeName: request.employeeName,
        requestType: request.requestType,
        status: request.status,
<<<<<<< HEAD
        adminNotes: request.adminNotes
      }
    });
  } catch (err) {
    console.error('Approve/Decline Manual Request Error:', err);
    res.status(500).json({
      message: 'Error processing manual request',
      error: err.message
=======
        adminNotes: request.adminNotes,
      },
    });
  } catch (err) {
    console.error("Approve/Decline Manual Request Error:", err);
    res.status(500).json({
      message: "Error processing manual request",
      error: err.message,
>>>>>>> master
    });
  }
};

// Get All Attendance Records
exports.getAllAttendanceRecords = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;
<<<<<<< HEAD
    
    let filter = {};
    
=======

    let filter = {};

>>>>>>> master
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: selectedDate,
<<<<<<< HEAD
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    
=======
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

>>>>>>> master
    if (status) {
      filter.status = status;
    }

    const attendanceRecords = await Attendance.find(filter)
<<<<<<< HEAD
      .populate('employeeId', 'name employeeId')
=======
      .populate("employeeId", "name employeeId")
>>>>>>> master
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(attendanceRecords);
  } catch (err) {
<<<<<<< HEAD
    console.error('Get All Attendance Records Error:', err);
    res.status(500).json({
      message: 'Error fetching attendance records',
      error: err.message
=======
    console.error("Get All Attendance Records Error:", err);
    res.status(500).json({
      message: "Error fetching attendance records",
      error: err.message,
>>>>>>> master
    });
  }
};

// Mark Absent Employees (Admin - Daily Task)
exports.markAbsentEmployees = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all employees
    const employees = await Employee.find();

    // Get today's attendance records
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
<<<<<<< HEAD
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const presentEmployeeIds = todayAttendance.map(att => att.employeeId.toString());
=======
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const presentEmployeeIds = todayAttendance.map((att) =>
      att.employeeId.toString()
    );
>>>>>>> master

    // Mark absent employees
    const absentEmployees = [];
    for (const employee of employees) {
      if (!presentEmployeeIds.includes(employee._id.toString())) {
        // Check if attendance record already exists
        let attendance = await Attendance.findOne({
          employeeId: employee._id,
          date: {
            $gte: today,
<<<<<<< HEAD
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
=======
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
>>>>>>> master
        });

        if (!attendance) {
          attendance = new Attendance({
            employeeId: employee._id,
            employeeName: employee.name,
            date: today,
<<<<<<< HEAD
            status: 'absent'
=======
            status: "absent",
>>>>>>> master
          });
          await attendance.save();
        }

        absentEmployees.push({
          employeeId: employee.employeeId,
<<<<<<< HEAD
          name: employee.name
=======
          name: employee.name,
>>>>>>> master
        });
      }
    }

    res.status(200).json({
<<<<<<< HEAD
      message: 'Absent employees marked successfully',
      absentCount: absentEmployees.length,
      absentEmployees
    });
  } catch (err) {
    console.error('Mark Absent Employees Error:', err);
    res.status(500).json({
      message: 'Error marking absent employees',
      error: err.message
=======
      message: "Absent employees marked successfully",
      absentCount: absentEmployees.length,
      absentEmployees,
    });
  } catch (err) {
    console.error("Mark Absent Employees Error:", err);
    res.status(500).json({
      message: "Error marking absent employees",
      error: err.message,
>>>>>>> master
    });
  }
};

<<<<<<< HEAD
exports.handleFileUpload = handleFileUpload; 
=======
exports.handleFileUpload = handleFileUpload;
>>>>>>> master
