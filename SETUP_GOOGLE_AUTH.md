# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your book store application.

## Prerequisites

- Google account
- Your application domain (for production) or `http://localhost` (for development)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Books Nepal")
5. Click "Create"

### 2. Enable Google+ API

1. In your project dashboard, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select **External** user type (unless you have a workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Your store name (e.g., "Books Nepal")
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **App domain**: Your website domain
   - **Authorized domains**: Add your domain (e.g., `booksnepal.com`)
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Select:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
   - Click "Update" then "Save and Continue"
7. **Test users** (for development):
   - Add your email and any test user emails
   - Click "Save and Continue"
8. Review and click "Back to Dashboard"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ Create Credentials" > "OAuth client ID"
3. Select application type: **Web application**
4. Enter name: "Book Store Web Client"
5. **Authorized JavaScript origins**:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
6. **Authorized redirect URIs**:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
7. Click "Create"
8. **IMPORTANT**: Copy the Client ID and Client Secret immediately!

### 5. Add Credentials to Your Application

1. Create or update your `.env` file in the project root:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# For production, change to:
# GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your_super_secret_random_string_here

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bookstore

# Site URL
SITE_URL=http://localhost:3000
```

### 6. Install Required Dependencies

Run the following command to install all necessary packages:

```bash
npm install passport passport-local passport-google-oauth20 express-session connect-mongo bcryptjs express-flash
```

### 7. Update server.js

Add the following to your `server.js` file (before routes):

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const passport = require('./config/passport');
const authController = require('./controllers/authController');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore',
    touchAfter: 24 * 3600 // lazy session update (24 hours)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
  }
}));

// Flash messages
app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Attach user to all views
app.use(authController.attachUser);

// Auth routes
app.use('/auth', require('./routes/auth.routes'));
```

### 8. Test the Integration

1. Start your application:
   ```bash
   npm start
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Click "Continue with Google"

4. You should be redirected to Google's login page

5. After successful authentication, you'll be redirected back to your app

### 9. Troubleshooting

#### Error: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in your code matches EXACTLY what you set in Google Cloud Console
- Check for:
  - http vs https
  - trailing slashes
  - port numbers

#### Error: "Access blocked: This app's request is invalid"
- **Solution**: Make sure you've added your email as a test user in the OAuth consent screen

#### Error: "invalid_client"
- **Solution**: Double-check your Client ID and Client Secret in the `.env` file

#### Sessions not persisting
- **Solution**: Make sure MongoDB is running and the `SESSION_SECRET` is set in `.env`

### 10. Production Deployment

When deploying to production:

1. Update `.env` with production values:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   SITE_URL=https://yourdomain.com
   NODE_ENV=production
   ```

2. Update Google Cloud Console:
   - Add production domain to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"

3. **Publish your OAuth consent screen**:
   - Go to "OAuth consent screen"
   - Click "Publish App"
   - (Optional) Submit for verification if you need more than 100 users

### 11. Security Best Practices

1. **Never commit `.env` file** to version control
2. Use strong `SESSION_SECRET` (at least 32 random characters)
3. Enable HTTPS in production (`secure: true` for cookies)
4. Regularly rotate your Google Client Secret
5. Monitor OAuth usage in Google Cloud Console
6. Implement rate limiting on auth endpoints

## Testing Checklist

- [ ] Google login button appears on login page
- [ ] Clicking Google button redirects to Google
- [ ] After Google auth, user is redirected back to app
- [ ] User account is created in database
- [ ] User can log out
- [ ] User can log back in with Google
- [ ] Existing email accounts can be linked with Google
- [ ] Sessions persist across page reloads

## Support

If you encounter issues:

1. Check Google Cloud Console logs
2. Check your application logs
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Clear browser cookies and try again

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Passport Google OAuth Strategy](https://github.com/jaredhanson/passport-google-oauth2)

---

**Note**: For development purposes, you can use test users. For production, you'll need to either verify your app or keep it in testing mode (limited to 100 users).

