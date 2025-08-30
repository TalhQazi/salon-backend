const express = require("express");
const router = express.Router();
const {
  addAdmin,
  getAllAdmins,
  adminAttendance,
  getAllAdminAttendance,
  getAdminAttendanceById,
  markAbsentAdmins,
  handleFileUpload,
} = require("../controller/adminController");

<<<<<<< HEAD
// Import unified user controller for role-based user creation
const {
  addUser,
  submitUserForm,
  captureUserFace,
  handleFileUpload: handleUnifiedFileUpload,
} = require("../controller/unifiedUserController");

// Add Admin (live picture optional) - supports both form-data and JSON
router.post(
  "/add",
  (req, res, next) => {
    // If content-type is JSON, skip file upload middleware
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("application/json")
    ) {
      return addAdmin(req, res, next);
    }
    // Otherwise use file upload middleware
    handleFileUpload(req, res, next);
  },
  addAdmin
);
=======
// Add Admin (live picture optional)
router.post("/add", handleFileUpload, addAdmin);
>>>>>>> ee42a375675c463dac2b0b73b81fa7f44145c240

// Get All Admins
router.get("/all", getAllAdmins);

// Admin Attendance (Check-In/Check-Out) - no live picture required
router.post("/attendance", adminAttendance);

// Get All Admin Attendance Records (with filters)
router.get("/attendance/all", getAllAdminAttendance);

// Get Admin Attendance by ID
router.get("/attendance/:adminId", getAdminAttendanceById);

// Mark Absent Admins (Daily Task)
router.post("/mark-absent", markAbsentAdmins);

<<<<<<< HEAD
// Admin Login with Email/Password
router.post("/login", require("../controller/adminController").adminLogin);

// Step 1: Submit User Form Data (Admin/Manager/Employee)
router.post("/submit-user-form", submitUserForm);

// Step 2: Capture Face and Complete Registration
router.post("/capture-user-face", handleUnifiedFileUpload, captureUserFace);

// Add User (Admin/Manager/Employee) - Legacy unified API (keeping for backward compatibility)
router.post(
  "/add-user",
  (req, res, next) => {
    // If content-type is JSON, skip file upload middleware
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("application/json")
    ) {
      return addUser(req, res, next);
    }
    // Otherwise use file upload middleware
    handleUnifiedFileUpload(req, res, next);
  },
  addUser
);

=======
>>>>>>> ee42a375675c463dac2b0b73b81fa7f44145c240
module.exports = router;
