const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  service: { type: String, required: true },
  attorney: String,
  preferredDate: Date,
  preferredTime: String,
  message: String,
  status: { type: String, enum: ['pending', 'confirmed', 'declined', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
