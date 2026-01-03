# 📚 Book Seeding Script Documentation

## 🎉 Overview

A comprehensive script that populates your database with realistic motivational and self-help books, complete with images from Pexels API.

## ✅ What Was Created

### **16 Premium Books Added**

1. **The Power of Positive Thinking** - Norman Vincent Peale
   - Categories: Motivational, Self-Help, Personal Development
   - Featured Book ⭐

2. **Atomic Habits** - James Clear
   - Categories: Self-Help, Personal Development, Productivity
   - Featured Book ⭐

3. **Think and Grow Rich** - Napoleon Hill
   - Categories: Success, Business, Personal Development
   - Featured Book ⭐

4. **The 7 Habits of Highly Effective People** - Stephen R. Covey
   - Categories: Personal Development, Leadership, Self-Help

5. **The Subtle Art of Not Giving a F*ck** - Mark Manson
   - Categories: Self-Help, Personal Development, Philosophy

6. **Can't Hurt Me** - David Goggins
   - Categories: Motivational, Biography, Self-Help
   - Featured Book ⭐

7. **Mindset** - Carol S. Dweck
   - Categories: Psychology, Personal Development, Success

8. **The 5 AM Club** - Robin Sharma
   - Categories: Productivity, Self-Help, Personal Development

9. **Grit** - Angela Duckworth
   - Categories: Psychology, Success, Personal Development

10. **Deep Work** - Cal Newport
    - Categories: Productivity, Business, Self-Help

11. **The Compound Effect** - Darren Hardy
    - Categories: Success, Personal Development, Business

12. **The Magic of Thinking Big** - David J. Schwartz
    - Categories: Motivational, Success, Personal Development

13. **Daring Greatly** - Brené Brown
    - Categories: Psychology, Self-Help, Personal Development
    - Featured Book ⭐

14. **The One Thing** - Gary Keller, Jay Papasan
    - Categories: Productivity, Business, Success

15. **Start With Why** - Simon Sinek
    - Categories: Leadership, Business, Motivational
    - Featured Book ⭐

16. **The Four Agreements** - Don Miguel Ruiz
    - Categories: Spirituality, Self-Help, Personal Development

## 📊 Statistics

- **Total Books:** 16
- **Featured Books:** 6 (marked with ⭐)
- **Categories:** 11 unique categories
- **Images:** All books have cover images from Pexels
- **Stock:** All books have 40-80 units in stock

## 🎨 Categories Included

1. Motivational
2. Self-Help
3. Personal Development
4. Success
5. Leadership
6. Productivity
7. Mindfulness
8. Psychology
9. Business
10. Spirituality
11. Biography

## 📖 Book Details

Each book includes:
- ✅ **Title & Subtitle**
- ✅ **Author(s)** - Text format (comma-separated)
- ✅ **Multiple Categories** - Array of category strings
- ✅ **Summary** - Brief description
- ✅ **Full Description** - HTML formatted content
- ✅ **Pricing** - Both MRP and Sale Price
- ✅ **Stock Information** - Quantity and threshold
- ✅ **Publisher Information**
- ✅ **ISBN-13 & ISBN-10** - Auto-generated
- ✅ **SKU** - Unique stock keeping unit
- ✅ **Publication Date** - Random date (2020-2024)
- ✅ **Language** - English
- ✅ **Binding** - Paperback/Hardcover
- ✅ **Page Count**
- ✅ **Tags** - Searchable keywords
- ✅ **Book Cover Image** - From Pexels API
- ✅ **SEO Metadata** - Title and description

## 🖼️ Image Integration

### Pexels API
- Each book gets a relevant cover image from Pexels
- Images are high-quality and portrait-oriented
- Fallback to placeholder if Pexels unavailable

### Image Queries Used
- "book success motivation"
- "book habits productivity"
- "book wealth success"
- "book leadership success"
- "book mindfulness philosophy"
- And more...

## 🚀 How to Use

### **Run the Seed Script**

```bash
# Basic usage
npm run seed-books

# Or directly
node scripts/seed-books.js
```

### **Options When Running**

When you run the script:
1. It connects to MongoDB
2. Checks for existing books
3. Asks if you want to delete existing books:
   - Type `yes` or `y` to clear and reseed
   - Type `no` or `n` to keep existing and add new

### **Re-running the Script**

You can run the script multiple times:
- Choose `yes` to start fresh with 16 books
- Choose `no` to add 16 more books (duplicates may occur)

## 🔧 Technical Details

### **File Location**
```
/scripts/seed-books.js
```

### **Dependencies**
- `mongoose` - Database connection
- `axios` - HTTP requests to Pexels API
- `dotenv` - Environment variables

### **Features**
- ✅ Auto-generates ISBN-13 and ISBN-10
- ✅ Creates unique slugs for URLs
- ✅ Generates unique SKUs
- ✅ Fetches images from Pexels API
- ✅ Fallback to placeholders if Pexels fails
- ✅ Rate limiting (500ms delay between books)
- ✅ Progress indicators
- ✅ Summary statistics

## 📝 Script Structure

```javascript
// 1. Connect to MongoDB
// 2. Check existing books
// 3. Ask user if they want to clear
// 4. Loop through book data
// 5. For each book:
//    - Fetch image from Pexels
//    - Generate ISBN, SKU, slug
//    - Create book in database
//    - Show progress
// 6. Display summary
// 7. Disconnect
```

## 🎯 Book Data Quality

### **Realistic Content**
- ✅ Real book titles from bestselling authors
- ✅ Accurate author names
- ✅ Realistic summaries and descriptions
- ✅ Appropriate pricing ($12.99 - $22.99)
- ✅ Reasonable stock quantities (40-80 units)
- ✅ Relevant tags and categories
- ✅ Professional metadata

### **SEO Optimized**
- Meta titles include book name
- Meta descriptions are summaries
- Slugs are URL-friendly
- Tags enhance searchability

## 🔒 Pexels API Configuration

### **With Pexels API Key**
Add to your `.env`:
```env
PEXELS_API_KEY=your_pexels_api_key_here
```

Images will be fetched from Pexels.

### **Without Pexels API Key**
Script automatically falls back to placeholder images:
```
https://picsum.photos/seed/{query}/800/1200
```

Both work perfectly fine!

## 📊 Database Schema Compatibility

The seed script is fully compatible with your updated Book model:

```javascript
{
  authors: String,              // "Dale Carnegie, Napoleon Hill"
  categories: [String],         // ["Motivational", "Success"]
  images: [{
    src: String,               // Image URL
    alt: String,               // Alt text
    width: Number,             // Image width
    height: Number             // Image height
  }]
}
```

## 🎨 Featured Books

6 books are marked as featured:
1. The Power of Positive Thinking
2. Atomic Habits
3. Think and Grow Rich
4. Can't Hurt Me
5. Daring Greatly
6. Start With Why

These will appear in featured sections on your website.

## 🛠️ Customization

### **Add More Books**

Edit `/scripts/seed-books.js` and add to `booksData` array:

```javascript
{
  title: "Your Book Title",
  subtitle: "Your Subtitle",
  authors: "Author Name",
  categories: ["Category1", "Category2"],
  summary: "Brief summary...",
  descriptionHTML: "<p>Full description...</p>",
  priceMRP: 29.99,
  priceSale: 23.99,
  stock: 50,
  publisher: "Publisher Name",
  language: "English",
  binding: "Paperback",
  pages: 300,
  tags: ["tag1", "tag2"],
  imageQuery: "search query for pexels",
  featured: false
}
```

### **Change Categories**

Update the `categories` array in any book data object.

Available categories in the form:
- Motivational
- Self-Help
- Personal Development
- Success
- Leadership
- Productivity
- Mindfulness
- Psychology
- Business
- Finance
- Health & Wellness
- Spirituality
- Biography
- Other

## 📈 Price Distribution

- **Budget Books:** $12.99 - $17.99
- **Mid-Range:** $18.99 - $22.99
- **Premium:** $23.99 - $28.99

Average sale price: ~$19.50

## 🔄 Update Existing Books

The script only creates new books. To update existing books:
1. Delete them first (when prompted)
2. Or modify them via the admin panel

## 🐛 Troubleshooting

### **MongoDB Connection Error**
```bash
# Check your .env file has:
MONGODB_URI=mongodb://localhost:27017/bookstore
```

### **Pexels Images Not Loading**
- Check your `PEXELS_API_KEY` in `.env`
- Script will automatically use placeholders if API fails
- No action needed - it works either way!

### **Duplicate Book Errors**
- The script generates unique slugs with timestamps
- If you get duplicates, clear the database first
- Answer `yes` when prompted to delete existing books

### **Slow Execution**
- Normal! The script has a 500ms delay between books
- This prevents API rate limiting
- Total time: ~10 seconds for 16 books

## ✅ Verification

After running the script:

1. **Check Admin Panel:**
   ```
   http://localhost:3000/admin/books
   ```

2. **Check Database:**
   ```bash
   # MongoDB shell
   use bookstore
   db.books.count()  # Should show 16
   db.books.find().limit(5)  # View sample books
   ```

3. **Check Featured Books:**
   ```bash
   db.books.find({ featured: true }).count()  # Should show 6
   ```

## 🎉 Success Indicators

You'll see:
```
📚 Starting Book Seed Script...
✅ Connected to MongoDB
Creating 16 books...
[1/16] Creating: The Power of Positive Thinking
   → Fetching image from Pexels...
   ✅ Created successfully
...
🎉 Successfully seeded all books!
Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Books: 16
Featured Books: 6
Categories Used: 11
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed script completed successfully!
```

## 📚 Related Scripts

- `npm run seed` - Original seed script (if any)
- `npm run create-admin` - Create admin user
- `npm run dev` - Start development server

## 🎯 Next Steps

1. **View Your Books:**
   - Login to admin panel
   - Navigate to Books section
   - See all 16 books with images!

2. **Customize:**
   - Edit any book via admin panel
   - Add more books manually
   - Or modify the seed script for more books

3. **Test Frontend:**
   - Visit your storefront
   - Browse categories
   - View book details
   - Check featured books section

## 💡 Pro Tips

1. **Keep Pexels API Key:** For high-quality images
2. **Run on Fresh Database:** For cleanest results
3. **Customize Data:** Make it yours!
4. **Re-run Anytime:** Safe to run multiple times
5. **Check Stock Levels:** All books start with good stock

## 🌟 Features Included

✅ 16 realistic books  
✅ Multiple categories per book  
✅ Professional descriptions  
✅ Relevant cover images  
✅ SEO optimized  
✅ Proper pricing  
✅ Stock management  
✅ Featured books  
✅ Publisher info  
✅ ISBN numbers  
✅ Tags for search  

---

**Ready to sell books!** 🚀📚

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

