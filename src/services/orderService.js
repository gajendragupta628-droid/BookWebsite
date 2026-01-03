const Order = require('../models/Order');
const Book = require('../models/Book');
const { env } = require('../config/env');
const { sendEmail } = require('../utils/email');

const genOrderNumber = async () => {
  const token = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  let number = token();
  while (await Order.findOne({ number })) number = token();
  return number;
};

const computeTotals = (cart) => {
  const subtotal = (cart.items || []).reduce((sum, it) => sum + it.price * it.qty, 0);
  const shipping = 0;
  const discountTotal = 0;
  const grandTotal = subtotal + shipping - discountTotal;
  return { subtotal, shipping, discountTotal, grandTotal, currency: env.STORE_CURRENCY };
};

const fromCart = async (cart, customer, { method = 'COD' } = {}, userId = null) => {
  if (!cart || !cart.items || !cart.items.length) throw new Error('Cart is empty');
  const number = await genOrderNumber();
  const items = [];
  for (const line of cart.items) {
    const book = await Book.findById(line.bookId);
    if (!book) throw new Error('Invalid book in cart');
    items.push({ book: book._id, titleSnapshot: book.title, priceAtPurchase: book.priceSale, qty: line.qty, sku: book.sku || '', image: (book.images[0] && book.images[0].src) || '' });
    await Book.findByIdAndUpdate(book._id, { $inc: { stock: -line.qty, sales: line.qty } });
  }
  const totals = computeTotals({ items: items.map(i => ({ price: i.priceAtPurchase, qty: i.qty })) });
  const order = await Order.create({ 
    number, 
    items, 
    totals, 
    customer, 
    userId, // Associate order with user if logged in
    payment: { method, status: method === 'COD' ? 'unpaid' : 'paid' }, 
    status: 'pending', 
    timeline: [{ label: 'Order placed', at: new Date(), by: 'system' }] 
  });

  // Emails
  try {
    await Promise.all([
      sendEmail({ to: customer.email || env.ADMIN_EMAIL, subject: `Order ${number} confirmed`, template: 'order-confirmation-customer', data: { order, env } }),
      sendEmail({ to: env.ADMIN_EMAIL, subject: `New order ${number}`, template: 'order-notification-admin', data: { order, env } })
    ]);
  } catch (e) {
    console.error('Email error', e);
  }

  return order;
};

module.exports = { fromCart, computeTotals };

