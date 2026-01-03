# ✅ Pexels API Integration Complete

## What Was Done

### 1. Created Pexels Service (`src/services/pexelsService.js`)
- ✅ Full Pexels API integration with proper authentication
- ✅ Search photos by theme/query
- ✅ Get curated photos
- ✅ **24-hour caching** to reduce API calls and avoid rate limits
- ✅ **Automatic fallback** images when API is unavailable
- ✅ Support for multiple image sizes (original, large, medium, small, landscape, portrait)

### 2. Updated Catalog Service (`src/services/catalogService.js`)
- ✅ Integrated Pexels images into home page data
- ✅ Fetches images for:
  - Hero banner (library scenes)
  - Used books section (6 images)
  - Nepali books section (6 images)

### 3. Updated Home Page (`src/views/site/home.ejs`)
- ✅ Hero banner uses Pexels API images
- ✅ Used books promo section uses API images
- ✅ Nepali books section uses API images
- ✅ All images have error fallbacks

### 4. Added Pexels Attribution (`src/views/partials/footer.ejs`)
- ✅ Prominent "Photos provided by Pexels" link in footer
- ✅ Complies with Pexels API terms of service
- ✅ Links back to https://www.pexels.com

### 5. Environment Configuration
- ✅ Added `PEXELS_API_KEY` to `src/config/env.js`
- ✅ Updated `env.example` with Pexels API instructions
- ✅ Created setup guide in `PEXELS_API_SETUP.md`

## 🚀 How to Use

### Step 1: Get Your Pexels API Key

1. Go to https://www.pexels.com/api/
2. Click "Get Started" (or log in if you have an account)
3. You'll receive your API key **instantly** (no waiting)

### Step 2: Create .env File

Since `.env` is gitignored, create it manually:

```bash
# In your project root
cp env.example .env
```

### Step 3: Add Your API Key to .env

Open `.env` and add your key:

```env
PEXELS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Example:
```env
PEXELS_API_KEY=563492ad6f917000010000019c29f6ae1234567890abcdef
```

### Step 4: Start Your Server

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll see:
- ✅ Dynamic Pexels images on the home page
- ✅ "Photos provided by Pexels" in the footer
- ✅ Better variety of professional book/library images

## 🎯 Features

### Intelligent Caching
- **24-hour cache**: API responses cached for 24 hours
- **Reduces API calls**: Same images served from cache
- **Rate limit protection**: Won't exceed 200 requests/hour limit

### Automatic Fallbacks
If Pexels API is unavailable:
- ✅ Automatically uses static fallback images
- ✅ Website continues working normally
- ✅ No broken images or errors

### Image Quality
Images available in multiple sizes:
- `original` - Full resolution
- `large` - 940px width
- `medium` - 350px height
- `small` - 130px height
- `landscape` - 1200x627px
- `portrait` - 800x1200px

## 📊 API Usage & Limits

### Free Tier (Default)
- **200 requests per hour**
- **20,000 requests per month**
- **Instant approval**

### How We Stay Under Limits
1. **Caching**: 24-hour cache for all responses
2. **Batch requests**: Fetch multiple themes in one Promise.all
3. **Fallbacks**: Static images if API unavailable
4. **Smart loading**: Only fetch on home page load

### Example Usage Calculation
- Home page load: **3 API requests** (hero, used books, nepali books)
- With 24-hour cache: Only **3 requests per day**
- **Monthly**: ~90 requests (well under 20,000 limit)

## 🔧 Troubleshooting

### Images Not Loading?

**Problem**: Still seeing old static images
**Solution**: Clear your browser cache and refresh

**Problem**: "PEXELS_API_KEY not set" in console
**Solution**: Make sure you created `.env` and added your key

**Problem**: "Pexels API error: 401"
**Solution**: Your API key is invalid. Get a new one from Pexels

**Problem**: "Pexels API error: 429"
**Solution**: Rate limit exceeded. Wait 1 hour or images will use fallbacks

### How to Test

1. **Check API key is loaded**:
   ```bash
   # Add this temporarily to src/server.js
   console.log('Pexels API Key:', process.env.PEXELS_API_KEY ? 'Set ✓' : 'Not Set ✗');
   ```

2. **Check logs for API calls**:
   ```bash
   npm run dev
   # Look for console.log or error messages
   ```

3. **Verify images are from Pexels**:
   - Open browser DevTools → Network tab
   - Reload home page
   - Look for image URLs containing `images.pexels.com`

## 📱 What Changes Across the Site

### Pages Using Pexels Images
Currently implemented:
- ✅ **Home Page** (hero, used books, nepali books sections)

Can be extended to:
- Category pages (add themed images per category)
- About page (add library/reading lifestyle images)
- Author pages (add portrait-style images)
- Blog posts (add relevant article images)

### How to Add Pexels Images to Other Pages

Example for a category page:

```javascript
// In controller
const pexelsService = require('../services/pexelsService');
const categoryImages = await pexelsService.getBookImages('bookshelf', 4);

res.render('site/category', {
  category,
  books,
  pexelsImages: categoryImages
});
```

```ejs
<!-- In EJS template -->
<% if (pexelsImages && pexelsImages[0]) { %>
  <img src="<%= pexelsImages[0].src.large %>" alt="<%= category.name %>" />
<% } %>
```

## 📚 API Documentation

### Main Functions

#### `getBookImages(theme, count)`
Get book-themed images
```javascript
const images = await pexelsService.getBookImages('library', 6);
// Returns array of image objects
```

**Themes Available**:
- `library` - Library interiors
- `bookshelf` - Bookshelf close-ups
- `reading` - People reading
- `books` - Book stacks
- `used-books` - Vintage books
- `nepali-books` - Literature
- `hero-banner` - Wide architecture shots

#### `searchPhotos(query, perPage, page)`
Search for any theme
```javascript
const data = await pexelsService.searchPhotos('books coffee', 10, 1);
// Returns: { photos: [...], page: 1, per_page: 10, total_results: 5000 }
```

#### `getCuratedPhotos(perPage, page)`
Get Pexels curated photos
```javascript
const data = await pexelsService.getCuratedPhotos(15, 1);
```

#### `clearCache()`
Clear the cache (for development)
```javascript
pexelsService.clearCache();
```

## 🎨 Image Attribution

### Footer Attribution
All pages now include:
```
📷 Photos provided by Pexels
```

This link:
- ✅ Meets Pexels API requirements
- ✅ Is prominent and visible
- ✅ Links back to pexels.com
- ✅ Opens in new tab

### Optional: Per-Image Attribution
For even better attribution, you can credit individual photographers:

```ejs
<% if (pexelsImages && pexelsImages[0]) { %>
  <img src="<%= pexelsImages[0].src.large %>" alt="..." />
  <small>
    Photo by 
    <a href="<%= pexelsImages[0].photographer_url %>">
      <%= pexelsImages[0].photographer %>
    </a> 
    on Pexels
  </small>
<% } %>
```

## 🚀 Production Deployment

### Add API Key to Production

**Vercel:**
```bash
vercel env add PEXELS_API_KEY production
# Enter your key when prompted
```

**Heroku:**
```bash
heroku config:set PEXELS_API_KEY=your_key_here
```

**Docker:**
```dockerfile
ENV PEXELS_API_KEY=your_key_here
```

### Request Higher Limits (Optional)

If your site gets popular:
1. Email Pexels: api@pexels.com
2. Show your implementation (our footer attribution)
3. Explain your use case
4. Many apps get **unlimited free access**!

## ✅ Checklist

Before deploying:
- [ ] Created `.env` file
- [ ] Added `PEXELS_API_KEY` to `.env`
- [ ] Tested locally - images loading
- [ ] Verified "Photos provided by Pexels" in footer
- [ ] Checked browser console for errors
- [ ] Added `PEXELS_API_KEY` to production environment

## 📞 Support

- **Pexels API Docs**: https://www.pexels.com/api/documentation/
- **Setup Guide**: See `PEXELS_API_SETUP.md`
- **API Terms**: https://www.pexels.com/api/documentation/#authorization

---

**All set! 🎉** Your website now uses professional, high-quality images from Pexels with proper attribution.

