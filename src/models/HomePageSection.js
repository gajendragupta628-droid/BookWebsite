const mongoose = require('mongoose');

const HomePageSectionSchema = new mongoose.Schema({
  sectionId: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['bestSellers', 'newArrivals', 'bookshelf', 'promo', 'featured', 'recommendations']
  },
  enabled: { type: Boolean, default: true },
  bookIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  displayLimit: { type: Number, default: 8 },
  title: { type: String },
  subtitle: { type: String },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

HomePageSectionSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('HomePageSection', HomePageSectionSchema);
