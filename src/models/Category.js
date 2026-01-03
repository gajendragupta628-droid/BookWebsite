const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true, trim: true },
  slug: { type: String, required: true, index: true },
  description: { type: String },
  heroImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);

