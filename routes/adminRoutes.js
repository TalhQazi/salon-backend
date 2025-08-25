const express = require('express');
const router = express.Router();
const {
  addAdmin,
  getAllAdmins,
  adminAttendance,
  getAllAdminAttendance,
  getAdminAttendanceById,
  markAbsentAdmins,
  handleFileUpload
} = require('../controller/adminController');

// Add Admin (live picture optional)
router.post('/add', handleFileUpload, addAdmin);

// Get All Admins
router.get('/all', getAllAdmins);

// Admin Attendance (Check-In/Check-Out) - no live picture required
router.post('/attendance', adminAttendance);

// Get All Admin Attendance Records (with filters)
router.get('/attendance/all', getAllAdminAttendance);

// Get Admin Attendance by ID
router.get('/attendance/:adminId', getAdminAttendanceById);

// Mark Absent Admins (Daily Task)
router.post('/mark-absent', markAbsentAdmins);

module.exports = router; 