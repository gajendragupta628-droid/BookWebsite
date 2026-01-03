const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  ctaText: String,
  ctaHref: String,
  image: String,
  position: { type: String, enum: ['home-hero', 'home-promo', 'category-hero'], default: 'home-hero' },
  active: { type: Boolean, default: true },
  sort: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);

