const Discount = require('../models/Discount');

exports.list = async (req, res) => {
  if (req.method === 'POST') {
    const { id, code, type, amount, minSubtotal, startsAt, endsAt, maxUses, active } = req.body;
    const data = { code, type, amount: Number(amount), minSubtotal: Number(minSubtotal || 0), startsAt: startsAt ? new Date(startsAt) : undefined, endsAt: endsAt ? new Date(endsAt) : undefined, maxUses: maxUses ? Number(maxUses) : undefined, active: !!active };
    if (id) await Discount.findByIdAndUpdate(id, data); else await Discount.create(data);
    return res.redirect('/admin/discounts');
  }
  const discounts = await Discount.find().sort({ createdAt: -1 });
  res.render('admin/discounts', { discounts });
};

exports.delete = async (req, res) => {
  await Discount.findByIdAndDelete(req.params.id);
  res.redirect('/admin/discounts');
};

