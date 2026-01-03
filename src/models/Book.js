const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  src: String,
  alt: String,
  width: Number,
  height: Number,
  focal: { type: String }
}, { _id: false });

const RatingsAggregateSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  avg: { type: Number, default: 0 }
}, { _id: false });

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  authors: { type: String, trim: true }, // Simple text field for authors
  publisher: String,
  language: String,
  binding: String,
  pages: Number,
  weightGrams: Number,
  dimensions: { L: Number, W: Number, H: Number },
  edition: String,
  series: String,
  format: { type: String, enum: ['Physical', 'Digital', ''], default: '' },
  isbn10: String,
  isbn13: String,
  publicationDate: Date,
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  sales: { type: Number, default: 0 }, // Track number of sales for popularity
  condition: { type: String, enum: ['new', 'used', ''], default: '' }, // Book condition
  priceMRP: Number,
  priceSale: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  tags: [{ type: String }],
  categories: [{ type: String }], // Multiple categories as strings
  summary: String,
  descriptionHTML: String,
  images: [ImageSchema],
  featured: { type: Boolean, default: false },
  ratingsAggregate: RatingsAggregateSchema,
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

BookSchema.virtual('discountPercent').get(function() {
  if (!this.priceMRP || !this.priceSale) return 0;
  return Math.max(0, Math.round((1 - (this.priceSale / this.priceMRP)) * 100));
});

BookSchema.index({
  title: 'text',
  subtitle: 'text',
  isbn10: 'text',
  isbn13: 'text',
  tags: 'text'
}, {
  name: 'book_text_search',
  default_language: 'none',
  language_override: 'textSearchLanguage'
});

module.exports = mongoose.model('Book', BookSchema);
