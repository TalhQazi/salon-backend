const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  addAdminAdvanceSalary,
  getAllAdminAdvanceSalary,
  getAdminAdvanceSalaryStats,
  getAdminAdvanceSalaryById,
  handleFileUpload,
} = require("../controller/adminAdvanceSalaryController");

// All routes require admin authentication
router.use(authenticate);
router.use(authorizeRoles("admin"));

// Add Admin Advance Salary (Direct Approval)
router.post("/add", handleFileUpload, addAdminAdvanceSalary);

// Get All Admin Advance Salary Records
router.get("/all", getAllAdminAdvanceSalary);

// Get Admin Advance Salary Stats
router.get("/stats", getAdminAdvanceSalaryStats);

// Get Admin Advance Salary by ID
router.get("/:recordId", getAdminAdvanceSalaryById);

module.exports = router;
