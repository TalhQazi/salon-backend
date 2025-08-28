const express = require("express");
const router = express.Router();
<<<<<<< HEAD
=======
const multer = require("multer");
>>>>>>> master
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

<<<<<<< HEAD
// Add Advance Booking (Admin)
router.post("/add", handleFileUpload, addAdvanceBooking);
=======
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Add Advance Booking (Admin)
router.post("/add", upload.single("image"), addAdvanceBooking);

// Get Booking Statistics (MUST BE BEFORE /:bookingId)
router.get("/stats", getBookingStats);
>>>>>>> master

// Get All Advance Bookings (with filters)
router.get("/all", getAllAdvanceBookings);

// Get Upcoming Reminders (24 hours before booking)
router.get("/reminders", getUpcomingReminders);

// Mark Reminder as Sent
router.put("/reminder/:bookingId", markReminderSent);

// Update Booking Status
router.put("/status/:bookingId", updateBookingStatus);

// Update Booking (Admin)
<<<<<<< HEAD
router.put("/:bookingId", handleFileUpload, updateBooking);
=======
router.put("/:bookingId", upload.single("image"), updateBooking);
>>>>>>> master

// Delete Booking (Admin)
router.delete("/:bookingId", deleteBooking);

<<<<<<< HEAD
// Get Booking by ID
router.get("/:bookingId", getBookingById);

// Get Booking Statistics
router.get("/stats", getBookingStats);

=======
// Get Booking by ID (MUST BE LAST)
router.get("/:bookingId", getBookingById);

>>>>>>> master
module.exports = router;
