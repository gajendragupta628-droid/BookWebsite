const { login } = require('../services/adminService');
const logger = require('../utils/logger');
const { env } = require('../config/env');

exports.getLogin = (req, res) => {
  logger.info({ 
    method: 'GET',
    path: '/admin/login',
    url: req.url,
    hasSession: !!req.session,
    adminUserId: req.session?.adminUserId 
  }, 'adminAuthController.getLogin called');
  
  if (req.session.adminUserId) {
    logger.info('Admin already logged in, redirecting to /admin');
    return res.redirect('/admin');
  }
  
  logger.info('Rendering admin login page from controller');
  res.render('admin/login', { error: null, layout: false, prefillEmail: env.ADMIN_EMAIL });
};

exports.postLogin = async (req, res) => {
  console.log('\n=== adminAuthController.postLogin CALLED ===');
  console.log('Email:', req.body.email);
  console.log('Has Password:', !!req.body.password);
  
  const { email, password } = req.body;
  
  console.log('Calling login service...');
  const user = await login({ email, password });
  console.log('Login service returned:', user ? `User ID: ${user._id}` : 'null');
  
  if (!user) {
    console.log('Invalid credentials - rendering error page');
    return res.status(401).render('admin/login', { error: 'Invalid credentials', layout: false, prefillEmail: env.ADMIN_EMAIL });
  }
  
  console.log('Login successful - setting session and redirecting to /admin');
  req.session.adminUserId = String(user._id);
  console.log('Session after setting adminUserId:', {
    adminUserId: req.session.adminUserId,
    sessionId: req.sessionID,
    sessionKeys: Object.keys(req.session)
  });
  
  // Explicitly save session before redirect
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).send('Error saving session');
    }
    console.log('Session saved successfully, redirecting to /admin');
    res.redirect('/admin');
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};
