# Authentication System - Quick Start Guide

## What Has Been Created

I've built a complete authentication system with:

✅ **User Login Page** (`/auth/login`)
✅ **User Signup Page** (`/auth/signup`)
✅ **Google OAuth Integration**
✅ **Local Authentication (Email/Password)**
✅ **User Model** with addresses, preferences, OAuth support
✅ **Passport.js Configuration** for both strategies
✅ **Auth Controllers & Routes**
✅ **Session Management**
✅ **Ultra-Premium UI Design** matching your site aesthetic

## Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in your project root:

```env
# Google OAuth (See SETUP_GOOGLE_AUTH.md for detailed steps)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=generate_a_random_32_character_string_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookstore

# Site Config
SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Update server.js

Add these lines to `src/server.js` (before your routes):

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const passport = require('./config/passport');
const authController = require('./controllers/authController');

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash messages
app.use(flash());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Attach user to views
app.use(authController.attachUser);

// Auth routes
app.use('/auth', require('./routes/auth.routes'));
```

## Google OAuth Setup

For detailed Google OAuth setup instructions, see **SETUP_GOOGLE_AUTH.md**.

### Quick Google OAuth Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

## Features Included

### User Authentication
- ✅ Email/Password signup and login
- ✅ Google OAuth ("Sign in with Google")
- ✅ Password hashing with bcryptjs
- ✅ Session management with MongoDB store
- ✅ "Remember me" functionality
- ✅ Password strength indicator
- ✅ OAuth account linking (if email already exists)

### Security
- ✅ Bcrypt password hashing
- ✅ Secure session cookies
- ✅ CSRF protection ready
- ✅ Account verification ready
- ✅ Password reset flow (ready for email integration)

### User Model Features
- ✅ Multiple addresses support
- ✅ User preferences (newsletter, notifications)
- ✅ Avatar/profile picture support
- ✅ Phone number
- ✅ Account verification status
- ✅ Last login tracking

## Available Routes

```
GET  /auth/login              - Login page
POST /auth/login              - Login form submission
GET  /auth/signup             - Signup page
POST /auth/signup             - Signup form submission
GET  /auth/logout             - Logout
GET  /auth/google             - Initiate Google OAuth
GET  /auth/google/callback    - Google OAuth callback
GET  /auth/forgot-password    - Password reset page
POST /auth/forgot-password    - Password reset submission
```

## Protecting Routes

To protect routes that require authentication:

```javascript
const { isAuthenticated } = require('./controllers/authController');

// Protect a route
router.get('/account', isAuthenticated, (req, res) => {
  // Only logged-in users can access
  res.render('site/account');
});

// Access current user in controller
router.get('/profile', isAuthenticated, (req, res) => {
  const user = req.user; // Current logged-in user
  res.render('site/profile', { user });
});
```

## Accessing Current User in Views

In any EJS template, you can access:

```ejs
<% if (currentUser) { %>
  <p>Welcome, <%= currentUser.name %>!</p>
  <a href="/auth/logout">Logout</a>
<% } else { %>
  <a href="/auth/login">Login</a>
  <a href="/auth/signup">Sign Up</a>
<% } %>
```

## Testing the System

1. Start your server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/auth/login`

3. Try:
   - Creating an account with email/password
   - Logging in with Google
   - Logging out
   - Logging back in

## Next Steps

### Immediate Todos:
1. [ ] Set up Google OAuth credentials
2. [ ] Add environment variables
3. [ ] Update server.js with session/passport configuration
4. [ ] Test login/signup flows
5. [ ] Create profile/account page (coming next!)

### Future Enhancements:
- Email verification
- Password reset emails
- Social media login (Facebook, Twitter)
- Two-factor authentication
- Account deletion
- Profile picture upload

## File Structure

```
src/
├── models/
│   └── User.js                 # User model with OAuth support
├── config/
│   └── passport.js             # Passport strategies configuration
├── controllers/
│   └── authController.js       # Authentication logic
├── routes/
│   └── auth.routes.js          # Auth routes
└── views/
    └── site/
        ├── login.ejs           # Login page
        └── signup.ejs          # Signup page
```

## Troubleshooting

### "Cannot find module 'passport'"
Run: `npm install`

### Google OAuth not working
1. Check `.env` has correct GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
2. Verify redirect URI matches in Google Console
3. Add your email as a test user in Google Console

### Sessions not persisting
1. Ensure MongoDB is running
2. Check SESSION_SECRET is set in `.env`
3. Clear browser cookies and try again

### "User is not authenticated" errors
Make sure you've added the passport middleware to server.js

## Support

For detailed Google OAuth setup: See `SETUP_GOOGLE_AUTH.md`
For questions: Check the troubleshooting sections in both guides

---

**Your authentication system is ready!** Just follow the 3 setup steps above and you'll have a fully functional auth system with Google OAuth. 🚀

