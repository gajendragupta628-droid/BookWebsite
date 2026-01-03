const passport = require('passport');
const User = require('../models/User');
const { buildMeta } = require('../utils/seo');
const { env } = require('../config/env');
const logger = require('../utils/logger');

// Show login page
exports.getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('site/login', {
    meta: buildMeta({ title: 'Sign In' }),
    error: req.flash('error')[0]
  });
};

// Show signup page
exports.getSignup = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('site/signup', {
    meta: buildMeta({ title: 'Create Account' }),
    error: req.flash('error')[0]
  });
};

// Handle local login
exports.postLogin = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      req.flash('error', info.message || 'Invalid credentials');
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      
      // Merge session cart and wishlist with user account
      await mergeSessionData(req, user);
      
      // Redirect to intended page
      const redirectTo = req.body.redirectTo || req.session.returnTo || '/account';
      delete req.session.returnTo;
      
      return res.redirect(redirectTo);
    });
  })(req, res, next);
};

// Handle signup
exports.postSignup = async (req, res, next) => {
  try {
    const { name, email, password, phone, marketingOptIn } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      req.flash('error', 'An account with this email already exists');
      return res.redirect('/auth/signup');
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || undefined,
      preferences: {
        newsletter: marketingOptIn === 'on',
        orderUpdates: true,
        recommendations: true
      }
    });

    // Log the user in
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      
      // Merge session cart and wishlist with user account
      await mergeSessionData(req, user);
      
      // TODO: Send welcome email
      
      // Redirect to intended page
      const redirectTo = req.body.redirectTo || req.session.returnTo || '/account';
      delete req.session.returnTo;
      
      return res.redirect(redirectTo);
    });
  } catch (error) {
    logger.error({ err: error, email: req.body.email }, 'Signup error');
    req.flash('error', error.message || 'An error occurred during signup');
    return res.redirect('/auth/signup');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy();
    res.redirect('/');
  });
};

// Google OAuth - Initiate
exports.googleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash('error', 'Google sign-in is not configured on this server.');
    return res.redirect('/auth/login');
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google OAuth - Callback
exports.googleCallback = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash('error', 'Google sign-in is not configured on this server.');
    return res.redirect('/auth/login');
  }
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      logger.error({ err }, 'Google auth error');
      req.flash(
        'error',
        env.NODE_ENV === 'development' ? `Google authentication failed: ${err.message}` : 'Authentication failed'
      );
      return res.redirect('/auth/login');
    }
    
    if (!user) {
      req.flash('error', 'Authentication failed');
      return res.redirect('/auth/login');
    }
    
    req.logIn(user, async (err) => {
      if (err) {
        logger.error({ err, userId: user?.id }, 'Login error');
        return next(err);
      }
      
      // Merge session cart and wishlist with user account
      await mergeSessionData(req, user);
      
      // Redirect to intended page or account
      const redirectTo = req.session.returnTo || '/account';
      delete req.session.returnTo;
      
      return res.redirect(redirectTo);
    });
  })(req, res, next);
};

// Forgot password page
exports.getForgotPassword = (req, res) => {
  res.render('site/forgot-password', {
    meta: buildMeta({ title: 'Reset Password' }),
    message: req.flash('message')[0],
    error: req.flash('error')[0]
  });
};

// Handle forgot password
exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      req.flash('message', 'If an account exists with this email, you will receive password reset instructions.');
      return res.redirect('/auth/forgot-password');
    }

    // TODO: Generate reset token and send email
    // For now, just show message
    req.flash('message', 'Password reset instructions have been sent to your email.');
    res.redirect('/auth/forgot-password');
  } catch (error) {
    logger.error({ err: error, email }, 'Forgot password error');
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/forgot-password');
  }
};

// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Store the intended destination
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Please sign in to continue');
  res.redirect('/auth/login');
};

// Helper function to merge session cart/wishlist with user account
async function mergeSessionData(req, user) {
  try {
    // Merge cart
    if (req.session.cart && req.session.cart.items && req.session.cart.items.length > 0) {
      if (!user.cart) user.cart = { items: [] };
      
      // Merge cart items
      for (const sessionItem of req.session.cart.items) {
        const existingItem = user.cart.items.find(
          item => String(item.bookId) === String(sessionItem.bookId)
        );
        
        if (existingItem) {
          // Update quantity
          existingItem.qty += sessionItem.qty;
        } else {
          // Add new item
          user.cart.items.push(sessionItem);
        }
      }
      
      // Clear session cart
      req.session.cart = { items: [] };
    }
    
    // Merge wishlist
    if (req.session.wishlist && req.session.wishlist.items && req.session.wishlist.items.length > 0) {
      if (!user.wishlist) user.wishlist = { items: [] };
      
      // Merge wishlist items (avoid duplicates)
      for (const sessionItemId of req.session.wishlist.items) {
        if (!user.wishlist.items.includes(sessionItemId)) {
          user.wishlist.items.push(sessionItemId);
        }
      }
      
      // Clear session wishlist
      req.session.wishlist = { items: [] };
    }
    
    // Save user
    await user.save();
    logger.debug({ userId: user.id }, 'Merged session cart/wishlist with user account');
  } catch (error) {
    logger.error({ err: error, userId: user?.id }, 'Error merging session data');
  }
}

// Middleware to attach user to res.locals for views
exports.attachUser = (req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
};
