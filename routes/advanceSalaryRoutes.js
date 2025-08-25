const express = require('express');
const router = express.Router();
const {
  addAdvanceSalaryRequest,
  getAllAdvanceSalaryRequests,
  getPendingAdvanceSalaryRequests,
  approveDeclineAdvanceSalary,
  getAdvanceSalaryById,
  getAdvanceSalaryStats,
  handleFileUpload
} = require('../controller/advanceSalaryController');

// Add Advance Salary Request (Manager)
router.post('/add', handleFileUpload, addAdvanceSalaryRequest);

// Get All Advance Salary Requests (with filters)
router.get('/all', getAllAdvanceSalaryRequests);

// Get Pending Advance Salary Requests (Admin)
router.get('/pending', getPendingAdvanceSalaryRequests);

// Approve/Decline Advance Salary Request (Admin)
router.put('/approve/:requestId', approveDeclineAdvanceSalary);

// Get Advance Salary Request by ID
router.get('/:requestId', getAdvanceSalaryById);

// Get Advance Salary Statistics
router.get('/stats', getAdvanceSalaryStats);

module.exports = router; 