# Pexels API Setup Guide

## Overview
This application uses the Pexels API to provide high-quality, royalty-free images for various sections of the website. The integration includes proper attribution as required by Pexels API terms.

## Why Pexels API?
- **Free to use**: Unlimited API access (with rate limits)
- **High-quality images**: Professional book and library photos
- **No attribution required** on images, but we include it in the footer as best practice
- **Rate limits**: 200 requests/hour, 20,000 requests/month (free tier)

## Quick Setup

### 1. Get Your Pexels API Key

1. Visit [https://www.pexels.com/api/](https://www.pexels.com/api/)
2. Sign up or log in to your Pexels account
3. Click "Get Started" or "Generate API Key"
4. You'll receive your API key instantly

### 2. Add API Key to Your Environment

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Open `.env` and add your Pexels API key:
   ```env
   PEXELS_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Your Server

```bash
npm run dev
```

That's it! The app will now fetch images from Pexels API.

## How It Works

### Image Fetching
- **Home Page**: Fetches hero banner, used books, and Nepali books images
- **Caching**: Results are cached for 24 hours to reduce API calls
- **Fallbacks**: If API fails or key is missing, falls back to static URLs

### File Structure
- `/src/services/pexelsService.js` - Main Pexels API integration
- `/src/services/catalogService.js` - Integrates Pexels images into home data
- `/src/views/site/home.ejs` - Uses Pexels images in the UI
- `/src/views/partials/footer.ejs` - Includes Pexels attribution

### API Usage

The service provides these main functions:

```javascript
// Search for specific book-themed images
await pexelsService.getBookImages('library', 6);

// Get curated photos
await pexelsService.getCuratedPhotos(15, 1);

// Search with custom query
await pexelsService.searchPhotos('books shelves', 10);
```

### Image Themes Available
- `library` - Library interiors and bookshelves
- `bookshelf` - Close-up bookshelf photos
- `reading` - People reading books
- `books` - Book stacks and collections
- `used-books` - Vintage and used book photos
- `nepali-books` - Literature and book-related images
- `hero-banner` - Wide library architecture shots

## Rate Limits & Best Practices

### Free Tier Limits
- **200 requests per hour**
- **20,000 requests per month**

### How We Handle Limits
1. **Caching**: All API responses cached for 24 hours
2. **Fallbacks**: Static image URLs if API unavailable
3. **Batch requests**: Multiple image themes fetched in parallel

### Monitoring Usage
Check response headers to monitor your usage:
```javascript
X-Ratelimit-Limit: 20000
X-Ratelimit-Remaining: 19684
X-Ratelimit-Reset: 1590529646
```

## Attribution Requirements

### What's Required
✅ Link back to Pexels (included in footer)
✅ Credit photographers when possible
❌ Don't copy Pexels core functionality

### Where Attribution Appears
- **Footer**: "Photos provided by Pexels" link (always visible)
- Complies with all Pexels API terms of service

## Troubleshooting

### Images Not Loading?

**Check 1**: Is your API key set?
```bash
# In your project directory
cat .env | grep PEXELS_API_KEY
```

**Check 2**: Check server logs for errors
```bash
npm run dev
# Look for "Error fetching from Pexels" messages
```

**Check 3**: Verify API key is valid
Test your key directly:
```bash
curl -H "Authorization: YOUR_API_KEY" \
  "https://api.pexels.com/v1/curated?per_page=1"
```

### Rate Limit Exceeded?

If you see errors about rate limits:
1. Images will automatically fall back to static URLs
2. Wait for the reset time (check X-Ratelimit-Reset header)
3. Consider requesting higher limits from Pexels if needed

### Cache Not Working?

Clear the cache programmatically:
```javascript
const pexelsService = require('./src/services/pexelsService');
pexelsService.clearCache();
```

## Production Deployment

### Environment Variables
Ensure `PEXELS_API_KEY` is set in your production environment:

**Heroku:**
```bash
heroku config:set PEXELS_API_KEY=your_key_here
```

**Vercel:**
```bash
vercel env add PEXELS_API_KEY
```

**Docker:**
```bash
docker run -e PEXELS_API_KEY=your_key_here ...
```

### Request Higher Limits
For production apps with high traffic:
1. Contact Pexels support
2. Show your implementation with attribution
3. Request unlimited free access
4. Most approved requests get unlimited access!

## Additional Resources

- [Pexels API Documentation](https://www.pexels.com/api/documentation/)
- [Pexels API Terms](https://www.pexels.com/api/documentation/#authorization)
- [Pexels License](https://www.pexels.com/license/)

## Support

If you encounter issues:
1. Check this guide first
2. Review [Pexels API docs](https://www.pexels.com/api/documentation/)
3. Check server console for error messages
4. Contact Pexels support for API-specific issues

---

**Note**: Without a Pexels API key, the app will use fallback images. The app works fine either way, but API images provide more variety and better visual appeal.

