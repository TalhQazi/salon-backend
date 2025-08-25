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
  upload.single("livePicture")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      });
    }
    console.log("📋 Parsed body:", req.body);
    console.log("📁 File:", req.file);
    next();
  });
};

// AWS Face Recognition Integration for Employee Attendance
const {
  enhancedFaceComparison,
  validateImageForFaceRecognition,
  cleanupTempImage,
} = require("../utils/imageUtils");

// Face verification function using AWS Rekognition
async function verifyEmployeeFace(storedImageUrl, attendanceImagePath) {
  try {
    console.log("🔍 Starting employee face verification for attendance...");

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

    // Perform enhanced face comparison
    const faceComparison = await enhancedFaceComparison(
      storedImageUrl, // Stored employee image
      attendanceImagePath // Current attendance image
    );

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
      return {
        success: false,
        similarity: faceComparison.similarity,
        message: faceComparison.message,
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
    };
  }
}

// Employee Check-In
exports.employeeCheckIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Live picture is required for check-in",
      });
    }

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Upload attendance image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "attendance",
      resource_type: "auto",
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Verify face using AWS Rekognition
    const faceVerification = await verifyEmployeeFace(
      employee.livePicture,
      req.file.path
    );
    if (!faceVerification.success) {
      // Clean up temporary image
      cleanupTempImage(req.file.path);

      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error,
      });
    }

    console.log(
      `✅ Face verification successful! Similarity: ${faceVerification.similarity}%`
    );

    // Clean up temporary image after successful verification
    cleanupTempImage(req.file.path);

    // Check if attendance already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        message: "Check-in already recorded for today",
      });
    }

    // Create or update attendance
    if (!attendance) {
      attendance = new Attendance({
        employeeId: employeeId,
        employeeName: employee.name,
        date: today,
        checkInTime: new Date(),
        checkInImage: result.secure_url,
        status: "present",
      });
    } else {
      attendance.checkInTime = new Date();
      attendance.checkInImage = result.secure_url;
      attendance.status = "present";
    }

    await attendance.save();

    res.status(200).json({
      message: "Check-in successful",
      attendance: {
        id: attendance._id,
        employeeName: attendance.employeeName,
        checkInTime: attendance.checkInTime,
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("Check-In Error:", err);
    res.status(500).json({
      message: "Error during check-in",
      error: err.message,
    });
  }
};

// Employee Check-Out
exports.employeeCheckOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Live picture is required for check-out",
      });
    }

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Upload attendance image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "attendance",
      resource_type: "auto",
    });

    // Delete local file
    fs.unlinkSync(req.file.path);

    // Verify face using AWS Rekognition
    const faceVerification = await verifyEmployeeFace(
      employee.livePicture,
      req.file.path
    );
    if (!faceVerification.success) {
      // Clean up temporary image
      cleanupTempImage(req.file.path);

      return res.status(400).json({
        message: faceVerification.message,
        similarity: faceVerification.similarity,
        error: faceVerification.error,
      });
    }

    console.log(
      `✅ Face verification successful! Similarity: ${faceVerification.similarity}%`
    );

    // Clean up temporary image after successful verification
    cleanupTempImage(req.file.path);

    // Find today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No check-in record found for today",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        message: "Check-out already recorded for today",
      });
    }

    // Update attendance with check-out
    attendance.checkOutTime = new Date();
    attendance.checkOutImage = result.secure_url;
    attendance.updatedAt = new Date();

    await attendance.save();

    res.status(200).json({
      message: "Check-out successful",
      attendance: {
        id: attendance._id,
        employeeName: attendance.employeeName,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("Check-Out Error:", err);
    res.status(500).json({
      message: "Error during check-out",
      error: err.message,
    });
  }
};

// Manual Attendance Request
exports.manualAttendanceRequest = async (req, res) => {
  try {
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
      });
    }

    // Validate request type
    if (!["checkin", "checkout"].includes(requestType)) {
      return res.status(400).json({
        message: "Request type must be either checkin or checkout",
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Create manual attendance request
    const manualRequest = new ManualAttendanceRequest({
      employeeId,
      employeeName,
      requestType,
      requestedTime,
      note,
    });

    await manualRequest.save();

    res.status(201).json({
      message: "Manual attendance request submitted successfully",
      request: {
        id: manualRequest._id,
        employeeName: manualRequest.employeeName,
        requestType: manualRequest.requestType,
        requestedTime: manualRequest.requestedTime,
        status: manualRequest.status,
      },
    });
  } catch (err) {
    console.error("Manual Attendance Request Error:", err);
    res.status(500).json({
      message: "Error submitting manual attendance request",
      error: err.message,
    });
  }
};

// Get Pending Manual Requests (Admin)
exports.getPendingManualRequests = async (req, res) => {
  try {
    const pendingRequests = await ManualAttendanceRequest.find({
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json(pendingRequests);
  } catch (err) {
    console.error("Get Pending Requests Error:", err);
    res.status(500).json({
      message: "Error fetching pending requests",
      error: err.message,
    });
  }
};

// Approve/Decline Manual Request (Admin)
exports.approveDeclineManualRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either approved or declined",
      });
    }

    const request = await ManualAttendanceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "Manual attendance request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }

    // Update request status
    request.status = status;
    request.adminNotes = adminNotes || "";
    request.updatedAt = new Date();

    await request.save();

    // If approved, create or update attendance record
    if (status === "approved") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let attendance = await Attendance.findOne({
        employeeId: request.employeeId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      if (!attendance) {
        attendance = new Attendance({
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          date: today,
          status: "present",
          isManualRequest: true,
          manualRequestData: {
            requestType: request.requestType,
            requestedTime: request.requestedTime,
            note: request.note,
            status: "approved",
            adminNotes: adminNotes,
          },
        });
      } else {
        attendance.isManualRequest = true;
        attendance.manualRequestData = {
          requestType: request.requestType,
          requestedTime: request.requestedTime,
          note: request.note,
          status: "approved",
          adminNotes: adminNotes,
        };
      }

      // Set check-in or check-out time based on request type
      if (request.requestType === "checkin") {
        attendance.checkInTime = new Date(request.requestedTime);
      } else if (request.requestType === "checkout") {
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
        adminNotes: request.adminNotes,
      },
    });
  } catch (err) {
    console.error("Approve/Decline Manual Request Error:", err);
    res.status(500).json({
      message: "Error processing manual request",
      error: err.message,
    });
  }
};

// Get All Attendance Records
exports.getAllAttendanceRecords = async (req, res) => {
  try {
    const { date, employeeId, status } = req.query;

    let filter = {};

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) {
      filter.status = status;
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("employeeId", "name employeeId")
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error("Get All Attendance Records Error:", err);
    res.status(500).json({
      message: "Error fetching attendance records",
      error: err.message,
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
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const presentEmployeeIds = todayAttendance.map((att) =>
      att.employeeId.toString()
    );

    // Mark absent employees
    const absentEmployees = [];
    for (const employee of employees) {
      if (!presentEmployeeIds.includes(employee._id.toString())) {
        // Check if attendance record already exists
        let attendance = await Attendance.findOne({
          employeeId: employee._id,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        });

        if (!attendance) {
          attendance = new Attendance({
            employeeId: employee._id,
            employeeName: employee.name,
            date: today,
            status: "absent",
          });
          await attendance.save();
        }

        absentEmployees.push({
          employeeId: employee.employeeId,
          name: employee.name,
        });
      }
    }

    res.status(200).json({
      message: "Absent employees marked successfully",
      absentCount: absentEmployees.length,
      absentEmployees,
    });
  } catch (err) {
    console.error("Mark Absent Employees Error:", err);
    res.status(500).json({
      message: "Error marking absent employees",
      error: err.message,
    });
  }
};

exports.handleFileUpload = handleFileUpload;
