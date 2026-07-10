const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  readTimeMinutes: { type: Number, default: 5 },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
