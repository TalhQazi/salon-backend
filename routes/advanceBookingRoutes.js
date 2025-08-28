const express = require("express");
const router = express.Router();
const {
  addAdvanceBooking,
  getAllAdvanceBookings,
  getUpcomingReminders,
  markReminderSent,
  updateBookingStatus,
  getBookingById,
  getBookingStats,
  deleteBooking,
  updateBooking,
  handleFileUpload,
} = require("../controller/advanceBookingController");

// Add Advance Booking (Admin)
router.post("/add", handleFileUpload, addAdvanceBooking);

// Get All Advance Bookings (with filters)
router.get("/all", getAllAdvanceBookings);

// Get Upcoming Reminders (24 hours before booking)
router.get("/reminders", getUpcomingReminders);

// Mark Reminder as Sent
router.put("/reminder/:bookingId", markReminderSent);

// Update Booking Status
router.put("/status/:bookingId", updateBookingStatus);

// Update Booking (Admin)
router.put("/:bookingId", handleFileUpload, updateBooking);

// Delete Booking (Admin)
router.delete("/:bookingId", deleteBooking);

// Get Booking by ID
router.get("/:bookingId", getBookingById);

// Get Booking Statistics
router.get("/stats", getBookingStats);

module.exports = router;
