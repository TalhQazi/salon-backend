const express = require('express');
const router = express.Router();
const {
  addAdminAdvanceSalary,
  getAllAdminAdvanceSalary,
  getAdminAdvanceSalaryStats,
  getAdminAdvanceSalaryById,
  handleFileUpload
} = require('../controller/adminAdvanceSalaryController');

// Add Advance Salary (Admin - Direct Approval)
router.post('/add', handleFileUpload, addAdminAdvanceSalary);

// Get All Admin Advance Salary Records
router.get('/all', getAllAdminAdvanceSalary);

// Get Admin Advance Salary Statistics
router.get('/stats', getAdminAdvanceSalaryStats);

// Get Admin Advance Salary by ID
router.get('/:recordId', getAdminAdvanceSalaryById);

module.exports = router; 