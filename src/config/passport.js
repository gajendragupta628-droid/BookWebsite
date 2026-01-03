const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { env } = require('./env');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return done(null, false, { message: 'Account has been deactivated' });
    }

    // Check if user signed up with Google
    if (user.provider === 'google' && !user.password) {
      return done(null, false, { message: 'Please sign in with Google' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    `${String(env.BASE_URL).replace(/\/$/, '')}/auth/google/callback`;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Check if user exists with this email
      user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.provider = 'google';
        user.isVerified = true; // Google accounts are pre-verified
        user.lastLogin = new Date();
        
        // Update avatar if not set
        if (!user.avatar && profile.photos && profile.photos.length > 0) {
          user.avatar = profile.photos[0].value;
        }
        
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = await User.create({
        googleId: profile.id,
        provider: 'google',
        name: profile.displayName,
        email: profile.emails[0].value.toLowerCase(),
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        isVerified: true,
        lastLogin: new Date()
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log('✓ Google OAuth configured');
} else {
  console.log('⚠ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

module.exports = passport;
