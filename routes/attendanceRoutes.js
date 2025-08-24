const express = require('express');
const router = express.Router();
const {
  employeeCheckIn,
  employeeCheckOut,
  manualAttendanceRequest,
  getPendingManualRequests,
  approveDeclineManualRequest,
  getAllAttendanceRecords,
  markAbsentEmployees,
  handleFileUpload
} = require('../controller/attendanceController');

// Employee Check-In with live picture
router.post('/checkin', handleFileUpload, employeeCheckIn);

// Employee Check-Out with live picture
router.post('/checkout', handleFileUpload, employeeCheckOut);

// Manual Attendance Request (for late employees)
router.post('/manual-request', manualAttendanceRequest);

// Get Pending Manual Requests (Admin)
router.get('/pending-requests', getPendingManualRequests);

// Approve/Decline Manual Request (Admin)
router.put('/approve-request/:requestId', approveDeclineManualRequest);

// Get All Attendance Records (with filters)
router.get('/all', getAllAttendanceRecords);

// Mark Absent Employees (Admin - Daily Task)
router.post('/mark-absent', markAbsentEmployees);

module.exports = router; 