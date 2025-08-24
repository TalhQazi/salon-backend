const mongoose = require('mongoose');

const advanceBookingSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  advancePayment: { type: Number, required: true },
  description: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  image: { type: String, required: true },
  reminderDate: { type: Date, required: true }
});

module.exports = mongoose.model('AdvanceBooking', advanceBookingSchema); 