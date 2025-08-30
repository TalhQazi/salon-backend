const mongoose = require("mongoose");

const advanceSalarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employeeName: { type: String },
  employeeLivePicture: { type: String }, // Cloudinary URL
  amount: { type: Number, required: true },
  image: { type: String, required: true }, // Cloudinary URL for proof
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Admin or Employee ID
  submittedByName: { type: String }, // Name of submitter
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
  adminNotes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update updatedAt
advanceSalarySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("AdvanceSalary", advanceSalarySchema);
