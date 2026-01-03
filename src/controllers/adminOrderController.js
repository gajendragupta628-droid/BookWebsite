const Order = require('../models/Order');

exports.dashboard = async (req, res) => {
  const Book = require('../models/Book');
  const [ordersToday, revenueToday, lowStock, totalBooks] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } } },
      { $group: { _id: null, sum: { $sum: '$totals.grandTotal' } } }
    ]).then(r => r[0]?.sum || 0),
    Book.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Book.countDocuments()
  ]);
  const latest = await Order.find().sort({ createdAt: -1 }).limit(10);
  res.render('admin/dashboard', { stats: { ordersToday, revenueToday, lowStock, totalBooks }, latest });
};

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.phone) filter['customer.phone'] = req.query.phone;
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);
  res.render('admin/orders-list', { orders, filter });
};

exports.view = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).render('site/404');
  res.render('admin/order-view', { order });
};

exports.updateStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).render('site/404');
  order.status = req.body.status || order.status;
  order.timeline.push({ label: `Status: ${order.status}`, by: req.session.adminUserId });
  await order.save();
  res.redirect(`/admin/orders/${order._id}`);
};

exports.exportCSV = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(1000);
  const header = 'number,grandTotal,currency,customer,phone,status,createdAt\n';
  const rows = orders.map(o => [o.number, o.totals.grandTotal, o.totals.currency, JSON.stringify(o.customer.name || ''), o.customer.phone || '', o.status, o.createdAt.toISOString()].join(','));
  res.type('text/csv').send(header + rows.join('\n'));
};

