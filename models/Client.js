const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      // Generate client ID with format: CLT + current year + 4 digit sequence
      const year = new Date().getFullYear();
      return `CLT${year}${Math.floor(Math.random() * 9000) + 1000}`;
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
  totalVisits: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  lastVisit: {
    type: Date,
    default: null,
  },
  visits: [
    {
      visitId: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      services: [
        {
          name: String,
          price: Number,
        },
      ],
      totalAmount: {
        type: Number,
        required: true,
      },
      billNumber: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
clientSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Client", clientSchema);
