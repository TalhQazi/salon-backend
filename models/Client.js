const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate client ID with format: CLT + current year + 4 digit sequence
      const year = new Date().getFullYear();
      return `CLT${year}${Math.floor(Math.random() * 9000) + 1000}`;
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

module.exports = mongoose.model('Client', clientSchema);
