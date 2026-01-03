module.exports.adminAuthRequired = (req, res, next) => {
  console.log('\n=== adminAuthRequired MIDDLEWARE CALLED ===');
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Has Session:', !!req.session);
  console.log('Admin User ID:', req.session?.adminUserId);
  console.log('Session keys:', req.session ? Object.keys(req.session) : 'no session');
  
  if (req.session && req.session.adminUserId) {
    console.log('Admin authenticated, allowing request');
    return next();
  }
  
  console.log('Admin not authenticated, redirecting to /admin/login');
  return res.redirect('/admin/login');
};

