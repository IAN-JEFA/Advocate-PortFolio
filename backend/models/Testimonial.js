const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientTitle: String,
  quote: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  published: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
