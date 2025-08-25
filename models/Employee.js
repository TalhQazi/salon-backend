const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate employee ID with format: EMP + current year + 4 digit sequence
      const year = new Date().getFullYear();
      return `EMP${year}${Math.floor(Math.random() * 9000) + 1000}`;
    }
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  idCardNumber: {
    type: String,
    required: true,
    unique: true
  },
  monthlySalary: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee',
    required: true
  },
  livePicture: {
    type: String, // Cloudinary URL for attendance matching
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', employeeSchema); 