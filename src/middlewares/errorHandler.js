const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  
  // Log error with context
  logger.error({
    err,
    status,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id
  }, 'Request error');

  if (err && err.code === 'EBADCSRFTOKEN' && req.accepts('html')) {
    try {
      req.flash('error', 'Form expired or invalid. Please refresh the page and try again.');
    } catch (_) {
      // ignore flash errors
    }
    const fallback = req.originalUrl && req.originalUrl.startsWith('/admin') ? '/admin' : '/';
    const redirectTo = req.get('Referrer') || fallback;
    return res.redirect(303, redirectTo);
  }
  
  if (req.accepts('html')) return res.status(status).render('site/500', { title: 'Error', message });
  if (req.accepts('json')) return res.status(status).json({ error: message });
  res.status(status).type('txt').send(message);
};
