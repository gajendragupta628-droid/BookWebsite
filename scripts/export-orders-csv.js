const { connectDB } = require('../src/config/db');
const Order = require('../src/models/Order');

async function run() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 });
  const header = 'number,grandTotal,currency,customer,phone,status,createdAt\n';
  const rows = orders.map(o => [o.number, o.totals.grandTotal, o.totals.currency, JSON.stringify(o.customer.name || ''), o.customer.phone || '', o.status, o.createdAt.toISOString()].join(','));
  process.stdout.write(header + rows.join('\n'));
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

