const mongoose = require('mongoose');

<<<<<<< HEAD
const serviceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const billSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String },
  services: { type: [serviceItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partially_paid', 'overdue', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
=======
const billSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  specialist: { type: String, required: true },
  duration: { type: String, required: true },
  service: { type: String, required: true }
>>>>>>> master
});

module.exports = mongoose.model('Bill', billSchema);
