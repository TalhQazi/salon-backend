const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      const year = new Date().getFullYear();
      return `ADM${year}${Math.floor(Math.random() * 9000) + 1000}`;
    }
  },
  name: { type: String, required: true },
<<<<<<< HEAD
  email: { type: String, required: true, unique: true },
=======
  email: { type: String, required: true }, // Email is compulsory
  password: { type: String, required: true }, // Password is compulsory
>>>>>>> master
  phoneNumber: { type: String, required: true, unique: true },
  livePicture: { type: String }, // Cloudinary URL for attendance matching (optional for admin)
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema); 