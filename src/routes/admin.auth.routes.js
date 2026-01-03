const router = require('express').Router();
const { postLogin, postLogout } = require('../controllers/adminAuthController');
const logger = require('../utils/logger');

// POST login - no security middleware
router.post('/admin/login', (req, res, next) => {
  console.log('\n=== POST /admin/login ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  console.log('Body:', { email: req.body.email, hasPassword: !!req.body.password });
  console.log('Has Session:', !!req.session);
  next();
}, postLogin);

// POST logout
router.post('/admin/logout', (req, res, next) => {
  logger.info({ method: 'POST', path: '/admin/logout' }, 'POST /admin/logout route hit');
  next();
}, postLogout);

module.exports = router;
