const mongoose = require('mongoose');

const attorneySchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  education: [String],
  specializations: [String],
  languages: [String],
  photoUrl: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attorney', attorneySchema);
