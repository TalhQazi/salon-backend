const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  addAdvanceSalary,
  getAllAdvanceSalary,
  getAdvanceSalaryStats,
  getAdvanceSalaryById,
  handleFileUpload,
} = require("../controller/advanceSalaryController");

// All routes require authentication
router.use(authenticate);

// Add Advance Salary (Employee)
router.post("/add", handleFileUpload, addAdvanceSalary);

// Get All Advance Salary Records
router.get("/all", authorizeRoles("admin", "manager"), getAllAdvanceSalary);

// Get Advance Salary Statistics
router.get("/stats", authorizeRoles("admin", "manager"), getAdvanceSalaryStats);

// Get Advance Salary by ID
router.get(
  "/:recordId",
  authorizeRoles("admin", "manager"),
  getAdvanceSalaryById
);

module.exports = router;
