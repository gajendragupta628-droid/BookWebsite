const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const pino = require('pino');
const csrf = require('csurf');
const flash = require('express-flash');
const expressLayouts = require('express-ejs-layouts');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { sessionConfig } = require('./config/session');
const { securityConfig } = require('./config/security');
const passport = require('./config/passport');
const authController = require('./controllers/authController');
const { ensureAdmin } = require('./services/adminService');

// Routes
const siteRoutes = require('./routes/site.routes');
const catalogRoutes = require('./routes/catalog.routes');
const cartRoutes = require('./routes/cart.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const adminAuthRoutes = require('./routes/admin.auth.routes');
const adminBooksRoutes = require('./routes/admin.books.routes');
const adminOrdersRoutes = require('./routes/admin.orders.routes');
const adminCatalogRoutes = require('./routes/admin.catalog.routes');
const adminBannersRoutes = require('./routes/admin.banners.routes');
const adminDiscountsRoutes = require('./routes/admin.discounts.routes');
const adminHomeRoutes = require('./routes/admin.home.routes');

// Middlewares
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { adminAuthRequired } = require('./middlewares/auth');
const { attachCSRFToken } = require('./middlewares/csrf');

const logger = pino({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' });

const app = express();

// Trust reverse proxies (needed for secure cookies + OAuth behind HTTPS proxies)
if (env.TRUST_PROXY || env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Validate environment variables before starting
const { validateEnv } = require('./config/env');
validateEnv();

// DB
connectDB()
  .then(async () => {
    logger.info('MongoDB connected successfully');

    const adminEmailExplicit = typeof process.env.ADMIN_EMAIL === 'string' && process.env.ADMIN_EMAIL.trim() !== '';
    const adminPasswordExplicit = typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.trim() !== '';
    const shouldBootstrapAdmin = env.NODE_ENV !== 'production' || (adminEmailExplicit && adminPasswordExplicit);

    if (shouldBootstrapAdmin) {
      await ensureAdmin({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        // In dev, keep the DB admin in sync with .env to avoid "can't login" confusion.
        forcePassword: env.NODE_ENV !== 'production'
      });
      logger.info({ email: env.ADMIN_EMAIL }, 'Ensured admin user exists');
    } else {
      logger.info('Skipping admin bootstrap (set ADMIN_EMAIL and ADMIN_PASSWORD to enable)');
    }
  })
  .catch((e) => {
    logger.fatal(e, 'Failed to connect to MongoDB');
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/base');

// Static
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '7d', etag: true }));
// Serve repo-level assets (e.g., branding logos)
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'), { maxAge: '7d', etag: true }));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security
app.use(helmet(securityConfig));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Sessions
app.use(session(sessionConfig()));

// Flash messages
app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Attach user to all views
app.use(authController.attachUser);

// Expose globals to views
app.use((req, res, next) => {
  res.locals.env = env;
  res.locals.store = { name: env.STORE_NAME, currency: env.STORE_CURRENCY };
  res.locals.session = req.session || {};
  if (typeof res.locals.meta === 'undefined') res.locals.meta = {};
  if (typeof res.locals.jsonld === 'undefined') res.locals.jsonld = null;
  next();
});

// Robots and health
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /');
});
app.get('/favicon.ico', (req, res) => res.redirect(302, '/assets/logo.png'));
app.get('/healthz', (req, res) => {
  const { getConnectionStatus } = require('./config/db');
  const dbStatus = getConnectionStatus();
  const health = {
    ok: dbStatus.isConnected,
    database: dbStatus.isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  };
  const statusCode = health.ok ? 200 : 503;
  res.status(statusCode).json(health);
});

// Public routes
app.use('/', siteRoutes);
app.use('/', catalogRoutes);
app.use('/', cartRoutes);
app.use('/', checkoutRoutes);
app.use('/', wishlistRoutes);

// User authentication routes
app.use('/auth', authRoutes);

// Admin login routes - registered EARLY, before any other routes or middleware
// This MUST be before accountRoutes and any /admin middleware

// GET /admin/login
app.get('/admin/login', (req, res) => {
  console.log('\n=== GET /admin/login ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  console.log('Has Session:', !!req.session);
  console.log('Admin User ID:', req.session?.adminUserId);
  
  if (req.session.adminUserId) {
    console.log('REDIRECTING: Admin already logged in -> /admin');
    return res.redirect('/admin');
  }
  
  console.log('RENDERING: Admin login page');
  res.locals.layout = 'layouts/admin';
  res.render('admin/login', { error: null, layout: false });
  console.log('RENDERED: Admin login page\n');
});

// POST /admin/login - register directly to bypass middleware
const { postLogin } = require('./controllers/adminAuthController');
app.post('/admin/login', (req, res, next) => {
  console.log('\n=== POST /admin/login ROUTE HIT (direct) ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  console.log('Body:', { email: req.body.email, hasPassword: !!req.body.password });
  next();
}, postLogin);

// User account routes (protected)
app.use('/', accountRoutes);

// Log all /admin/* requests for debugging - intercept redirects
app.use('/admin', (req, res, next) => {
  console.log('\n=== /admin MIDDLEWARE CHAIN ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  
  // Intercept redirects to log them
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    console.log('\n=== REDIRECT DETECTED IN /admin MIDDLEWARE ===');
    console.log('FROM:', req.originalUrl);
    console.log('TO:', url);
    console.log('STATUS:', res.statusCode || 302);
    console.log('Stack:', new Error().stack.split('\n').slice(0, 10).join('\n'));
    return originalRedirect.call(this, url);
  };
  
  next();
});

// Admin auth routes (POST login/logout) - must be before admin protection middleware
// These routes are public and don't require authentication
console.log('Registering adminAuthRoutes...');
app.use('/', adminAuthRoutes);

// Admin protected + CSRF + default admin layout
// This middleware applies to all /admin/* routes EXCEPT /admin/login and /admin/logout
app.use('/admin', (req, res, next) => {
  console.log('\n=== Admin middleware - first ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Has Session:', !!req.session);
  console.log('Admin User ID:', req.session?.adminUserId);
  
  // Skip auth check for login and logout routes
  if (req.path === '/login' || req.path === '/logout') {
    console.log('Skipping admin auth for login/logout');
    return next();
  }
  console.log('Applying admin auth requirement for path:', req.path);
  return adminAuthRequired(req, res, next);
}, (req, res, next) => {
  console.log('Admin middleware - CSRF: path =', req.path);
  // Skip CSRF validation for login/logout routes
  if (req.path === '/login' || req.path === '/logout') {
    console.log('Skipping CSRF for login/logout');
    return next();
  }
  // Multipart form submissions are parsed by multer at the route level; csurf must run after multer.
  if (req.is('multipart/form-data')) {
    console.log('Skipping CSRF here for multipart/form-data (validated after multer)');
    return next();
  }
  console.log('Applying CSRF validation');
  return csrf()(req, res, next);
}, attachCSRFToken, (req, res, next) => { 
  console.log('Admin middleware - layout: path =', req.path);
  res.locals.layout = 'layouts/admin'; 
  next(); 
});
app.use('/', adminBooksRoutes);
app.use('/', adminOrdersRoutes);
app.use('/', adminCatalogRoutes);
app.use('/', adminBannersRoutes);
app.use('/', adminDiscountsRoutes);
app.use('/', adminHomeRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

const port = env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => logger.info(`Server on http://localhost:${port}`));
}

module.exports = app;
