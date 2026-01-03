const Banner = require('../models/Banner');

exports.list = async (req, res) => {
  if (req.method === 'POST') {
    const { id, title, subtitle, ctaText, ctaHref, image, position, active, sort } = req.body;
    const data = { title, subtitle, ctaText, ctaHref, image, position, active: !!active, sort: Number(sort || 0) };
    if (id) await Banner.findByIdAndUpdate(id, data); else await Banner.create(data);
    return res.redirect('/admin/banners');
  }
  const banners = await Banner.find().sort({ position: 1, sort: 1 });
  res.render('admin/banners', { banners });
};

exports.delete = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.redirect('/admin/banners');
};

