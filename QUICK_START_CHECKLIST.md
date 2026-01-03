# ⚡ Quick Start Checklist

Follow these steps to get your ultra-premium book store up and running with Google OAuth.

---

## ✅ Pre-Setup Checklist

- [ ] MongoDB installed and running
- [ ] Node.js v20+ installed
- [ ] Google account ready
- [ ] Code editor open

---

## 📦 Step 1: Install Dependencies (2 minutes)

```bash
cd /Users/aadityashah/Documents/BOOK_WEB_APP
npm install
```

**What this does:** Installs all required packages including passport, express-session, etc.

---

## 🔑 Step 2: Google OAuth Setup (5-10 minutes)

### A. Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click dropdown at top → "New Project"
3. Name: **"Books Nepal"** (or your store name)
4. Click **"Create"**

### B. Enable Google+ API

1. Menu → "APIs & Services" → "Library"
2. Search: **"Google+ API"**
3. Click it → Press **"Enable"**

### C. Configure OAuth Consent Screen

1. Menu → "APIs & Services" → "OAuth consent screen"
2. Select: **"External"**
3. Fill in:
   - App name: **Your Store Name**
   - User support email: **Your Email**
   - Developer contact: **Your Email**
4. Click **"Save and Continue"**
5. Scopes → Click **"Add or Remove Scopes"**
   - Select: `./auth/userinfo.email`
   - Select: `./auth/userinfo.profile`
   - Click **"Update"** → **"Save and Continue"**
6. Test users → **Add your email**
7. Click **"Save and Continue"**

### D. Create OAuth Credentials

1. Menu → "APIs & Services" → "Credentials"
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **"Book Store Web Client"**
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/google/callback
   ```
7. Click **"Create"**
8. **⚠️ IMPORTANT:** Copy both:
   - Client ID
   - Client Secret

---

## 📝 Step 3: Create .env File (2 minutes)

Create `.env` in project root:

```env
# Google OAuth (Paste your credentials from Step 2D)
GOOGLE_CLIENT_ID=paste_your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret (Generate random string or use this)
SESSION_SECRET=b8f5e9a2c7d4f1e8a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2

# Database
MONGODB_URI=mongodb://localhost:27017/bookstore

# App Settings
SITE_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

**Replace:**
- `GOOGLE_CLIENT_ID` with your actual Client ID
- `GOOGLE_CLIENT_SECRET` with your actual Client Secret
- (Optional) Generate new `SESSION_SECRET` using: `openssl rand -hex 32`

---

## 🔧 Step 4: Update server.js (3 minutes)

Open `src/server.js` and add **BEFORE** your route definitions:

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
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash messages
app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Attach user to views
app.use(authController.attachUser);

// Auth routes
app.use('/auth', require('./routes/auth.routes'));
```

**Where to add:** After `app.use(express.json())` but before your existing routes like `app.use('/', siteRoutes)`

---

## 🎨 Step 5: Build CSS (1 minute)

```bash
npm run build:css
```

---

## 🚀 Step 6: Start the Server (1 minute)

```bash
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3000
Connected to MongoDB
```

---

## 🧪 Step 7: Test Everything (5 minutes)

### Test Authentication:

1. **Visit Login Page:**
   ```
   http://localhost:3000/auth/login
   ```
   - Should see premium login page with Google button

2. **Test Google OAuth:**
   - Click "Continue with Google"
   - Select your Google account
   - Should redirect back to your site
   - Check if you're logged in

3. **Test Local Signup:**
   ```
   http://localhost:3000/auth/signup
   ```
   - Fill in the form
   - Create an account
   - Should redirect to account page

4. **Visit Account Page:**
   ```
   http://localhost:3000/account
   ```
   - Should see your profile
   - Orders, Wishlist, Addresses, Settings tabs

5. **Test Logout:**
   - Click logout button
   - Should redirect to home

### Test Other Pages:

- [ ] Home: `http://localhost:3000/`
- [ ] Search: `http://localhost:3000/search`
- [ ] Cart: `http://localhost:3000/cart`
- [ ] Wishlist: `http://localhost:3000/wishlist`

---

## ✅ Success Indicators

You'll know it's working when:

- ✅ Login page loads with Google button
- ✅ Clicking Google button redirects to Google
- ✅ After Google auth, you're redirected back
- ✅ Account page shows your Google profile info
- ✅ Logout works correctly
- ✅ All pages have premium design

---

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** 
1. Go to Google Console → Credentials
2. Edit your OAuth client
3. Make sure redirect URI is exactly: `http://localhost:3000/auth/google/callback`
4. No trailing slash!

### Issue: "This app isn't verified"
**Solution:**
1. Google Console → OAuth consent screen
2. Add your email to "Test users"
3. Try again

### Issue: "Cannot find module 'passport'"
**Solution:**
```bash
npm install
```

### Issue: Sessions not working
**Solution:**
1. Check MongoDB is running: `mongosh`
2. Check `.env` has `SESSION_SECRET`
3. Clear browser cookies
4. Restart server

### Issue: CSS not loading
**Solution:**
```bash
npm run build:css
```

---

## 📊 Completion Checklist

- [ ] Dependencies installed
- [ ] Google Cloud project created
- [ ] OAuth credentials obtained
- [ ] `.env` file created with credentials
- [ ] `server.js` updated with session/passport code
- [ ] CSS built
- [ ] Server started successfully
- [ ] Login page accessible
- [ ] Google OAuth working
- [ ] Local signup working
- [ ] Account page showing user info
- [ ] All pages display correctly

---

## 🎯 What You Can Do Now

With authentication working, you can now:

1. **Protect routes** - Make cart/wishlist require login
2. **Track orders** - Associate orders with users
3. **Save preferences** - Remember user settings
4. **Build features** - Reviews, ratings, recommendations
5. **Deploy** - Move to production!

---

## 📚 Additional Resources

- **Detailed OAuth Guide:** `SETUP_GOOGLE_AUTH.md`
- **Auth Summary:** `AUTH_SETUP_SUMMARY.md`
- **Complete Overview:** `COMPLETE_PROJECT_SUMMARY.md`

---

## 🎉 You're Done!

Your **ultra-premium book store** with **Google OAuth authentication** is now live! 

Visit: `http://localhost:3000`

---

**Need help?** Review the troubleshooting section or check the detailed guides.

**Ready for production?** Update `.env` with production values and deploy!

🚀 Happy Coding! 📚✨

