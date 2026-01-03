const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  amount: { type: Number, required: true },
  minSubtotal: { type: Number, default: 0 },
  startsAt: Date,
  endsAt: Date,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Discount', DiscountSchema);

