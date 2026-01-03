const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  titleSnapshot: String,
  priceAtPurchase: Number,
  qty: Number,
  sku: String,
  image: String
}, { _id: false });

const TotalsSchema = new mongoose.Schema({
  subtotal: Number,
  discountTotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  grandTotal: Number,
  currency: { type: String, default: 'USD' }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['COD', 'PREPAID'], default: 'COD' },
  status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  transactionId: String
}, { _id: false });

const TimelineSchema = new mongoose.Schema({
  label: String,
  at: { type: Date, default: Date.now },
  by: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  number: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associate order with user
  items: [OrderItemSchema],
  totals: TotalsSchema,
  customer: CustomerSchema,
  payment: PaymentSchema,
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'New', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], default: 'pending' },
  notes: String,
  timeline: [TimelineSchema]
}, { timestamps: true });

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', OrderSchema);

