const express = require("express");
const router = express.Router();
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  addAdvanceSalary,
  getAllAdvanceSalary,
  getAdvanceSalaryById,
  handleFileUpload,
} = require("../controller/advanceSalaryController");

// All routes require authentication
router.use(authenticate);

// Add Advance Salary
router.post("/add", handleFileUpload, addAdvanceSalary);

// Get All Advance Salary Records
router.get("/all", getAllAdvanceSalary);

// Get Advance Salary by ID
router.get("/:recordId", getAdvanceSalaryById);

module.exports = router;
