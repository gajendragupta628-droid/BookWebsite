module.exports = (req, res, next) => {
  res.status(404);
  if (req.accepts('html')) return res.render('site/404', { title: 'Not Found' });
  if (req.accepts('json')) return res.json({ error: 'Not Found' });
  res.type('txt').send('Not Found');
};

