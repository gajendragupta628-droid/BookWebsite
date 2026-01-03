# 🚀 Quick Start: Pexels API Integration

## ⚡ 3-Minute Setup

### Step 1: Get Your Free Pexels API Key (1 minute)

1. Visit: **https://www.pexels.com/api/**
2. Click **"Get Started"** (or log in)
3. **Copy your API key** (you'll get it instantly!)

### Step 2: Create .env File (1 minute)

```bash
# In your project directory
cp env.example .env
```

Open `.env` in your editor and add your key:

```env
PEXELS_API_KEY=paste_your_actual_key_here
```

### Step 3: Test the Integration (1 minute)

```bash
# Test if API key works
node test-pexels-api.js

# If successful, start your server
npm run dev
```

Visit `http://localhost:3000` - you should see Pexels images! 🎉

---

## ✅ What You Should See

### On the Website
- ✅ Hero banner with professional library images
- ✅ Used books section with 6 different book photos
- ✅ Nepali books section with themed images
- ✅ **"📷 Photos provided by Pexels"** link in footer

### In Browser DevTools (Network Tab)
- ✅ Image URLs starting with `images.pexels.com`

### In Server Console
- ✅ No error messages about Pexels API

---

## 🆘 Troubleshooting

### "PEXELS_API_KEY not set"
```bash
# Check if .env file exists
ls -la .env

# Check if key is in the file
cat .env | grep PEXELS_API_KEY
```

**Fix**: Make sure `.env` exists and has `PEXELS_API_KEY=your_key`

### "Pexels API error: 401"
**Fix**: Your API key is invalid. Get a new one from https://www.pexels.com/api/

### Still seeing old images?
```bash
# Clear browser cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or hard refresh
Ctrl+F5 (Windows/Linux)
Cmd+Option+R (Mac)
```

---

## 📊 How It Works

### Smart Features
- **24-hour caching**: Same images served from memory for 24 hours
- **Auto fallback**: If API fails, uses static images automatically
- **Rate limit protection**: Only ~3 API calls per day for home page

### Rate Limits (Free Tier)
- 200 requests/hour
- 20,000 requests/month
- With caching: You'll use ~90 requests/month ✅

---

## 📚 Documentation

- **Full Setup Guide**: `PEXELS_API_SETUP.md`
- **Integration Summary**: `PEXELS_INTEGRATION_SUMMARY.md`
- **Pexels API Docs**: https://www.pexels.com/api/documentation/

---

## 🎯 Production Deployment

When deploying to production, add your API key to environment variables:

```bash
# Vercel
vercel env add PEXELS_API_KEY

# Heroku
heroku config:set PEXELS_API_KEY=your_key

# Netlify
# Add in site settings → Environment variables
```

---

## ✨ That's It!

Your website now has:
- ✅ Professional Pexels images
- ✅ Proper attribution in footer
- ✅ Automatic caching & fallbacks
- ✅ Compliant with Pexels API terms

**Enjoy your beautiful image gallery! 🎉📚**

