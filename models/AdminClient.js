const mongoose = require("mongoose");

const adminClientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      const year = new Date().getFullYear();
      return `ACLT${year}${Math.floor(Math.random() * 9000) + 1000}`;
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

// Note: clientId and phoneNumber already have unique: true in schema
// Only adding index for name field
adminClientSchema.index({ name: 1 });

module.exports = mongoose.model("AdminClient", adminClientSchema);
