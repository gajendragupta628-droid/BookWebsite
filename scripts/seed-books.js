#!/usr/bin/env node

/**
 * Seed Books Script (REAL books + REAL cover images)
 * - Uses Open Library Covers API (ISBN-based) so images are real book covers
 * - Falls back to Google Books thumbnails if Open Library has no cover
 * - Currency set to NPR (Nepalese Rupee) with realistic Nepal pricing
 * - Includes Nepali books in नेपाली (Devanagari) script
 */

const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// -------------------- Mongo --------------------
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is required (set it in your .env or environment).');
  process.exit(1);
}

// -------------------- Schemas --------------------
const ImageSchema = new mongoose.Schema(
  {
    src: String,
    alt: String,
    width: Number,
    height: Number,
    focal: { type: String },
  },
  { _id: false }
);

const RatingsAggregateSchema = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    avg: { type: Number, default: 0 },
  },
  { _id: false }
);

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    authors: { type: String, trim: true },
    publisher: String,
    language: String,
    binding: String,
    pages: Number,
    weightGrams: Number,
    dimensions: { L: Number, W: Number, H: Number },
    isbn10: String,
    isbn13: String,
    publicationDate: Date,
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    priceMRP: Number,
    priceSale: { type: Number, required: true },
    currency: { type: String, default: 'NPR' },
    tags: [{ type: String }],
    categories: [{ type: String }],
    summary: String,
    descriptionHTML: String,
    images: [ImageSchema],
    featured: { type: Boolean, default: false },
    ratingsAggregate: RatingsAggregateSchema,
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

BookSchema.index(
  {
    title: 'text',
    subtitle: 'text',
    isbn10: 'text',
    isbn13: 'text',
    tags: 'text',
  },
  {
    name: 'book_text_search',
    default_language: 'none',
    language_override: 'textSearchLanguage',
  }
);

const Book = mongoose.model('Book', BookSchema);

// -------------------- Helpers --------------------
function generateSKU() {
  const prefix = 'BK';
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${random}`;
}

// Unicode-safe slug (keeps Nepali letters too)
function generateSlug(title) {
  const base = title
    .trim()
    .toLowerCase()
    // Replace anything that's not a letter/number with hyphen (unicode-safe)
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');

  // Ensure not empty
  const safeBase = base.length ? base : 'book';
  return `${safeBase}-${Date.now()}`;
}

// Open Library Covers API
// Pattern: https://covers.openlibrary.org/b/isbn/{ISBN}-{S|M|L}.jpg?default=false
function openLibraryCoverUrl(isbn, size = 'L') {
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg?default=false`;
}

async function urlExists(url) {
  try {
    // HEAD is enough; OL returns 404 if default=false and not found
    await axios.head(url, { timeout: 8000, maxRedirects: 5 });
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchGoogleBooksCover(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`;
    const res = await axios.get(url, { timeout: 10000 });
    const item = res.data?.items?.[0];
    const links = item?.volumeInfo?.imageLinks;

    // Prefer higher res if present
    const src =
      links?.extraLarge ||
      links?.large ||
      links?.medium ||
      links?.thumbnail ||
      links?.smallThumbnail;

    if (!src) return null;

    // Google sometimes returns http thumbnails; upgrade to https
    const httpsSrc = src.replace(/^http:\/\//i, 'https://');

    // Dimensions usually not provided; keep common cover ratio
    return { src: httpsSrc, width: 800, height: 1200 };
  } catch (e) {
    return null;
  }
}

/**
 * Fetch a REAL cover image for a REAL book:
 * 1) Open Library (best for "real cover" via ISBN)
 * 2) Google Books (fallback)
 * 3) Final placeholder (only if both fail)
 */
async function fetchRealBookCover({ title, isbn13, isbn10 }) {
  const candidateIsbns = [isbn13, isbn10].filter(Boolean);

  // 1) Open Library (L)
  for (const isbn of candidateIsbns) {
    const olUrl = openLibraryCoverUrl(isbn, 'L');
    const ok = await urlExists(olUrl);
    if (ok) {
      return {
        src: olUrl.replace('?default=false', ''), // use clean URL for front-end
        alt: title,
        width: 800,
        height: 1200,
      };
    }
  }

  // 2) Google Books
  for (const isbn of candidateIsbns) {
    const gb = await fetchGoogleBooksCover(isbn);
    if (gb) {
      return { src: gb.src, alt: title, width: gb.width, height: gb.height };
    }
  }

  // 3) Placeholder (last resort)
  const seed = encodeURIComponent(`${title}-${isbn13 || isbn10 || 'noisbn'}`);
  return {
    src: `https://picsum.photos/seed/${seed}/800/1200`,
    alt: title,
    width: 800,
    height: 1200,
  };
}

async function ensureSafeBookTextIndex() {
  const indexes = await Book.collection.indexes();

  const safeExisting = indexes.find(
    (idx) => idx.name === 'book_text_search' && idx.language_override === 'textSearchLanguage'
  );
  if (safeExisting) return;

  const toDrop = indexes.filter(
    (idx) =>
      idx.key?._fts === 'text' &&
      (idx.language_override === 'language' || typeof idx.language_override === 'undefined')
  );

  for (const idx of toDrop) {
    await Book.collection.dropIndex(idx.name);
  }

  await Book.collection.createIndex(
    {
      title: 'text',
      subtitle: 'text',
      isbn10: 'text',
      isbn13: 'text',
      tags: 'text',
    },
    {
      name: 'book_text_search',
      default_language: 'none',
      language_override: 'textSearchLanguage',
    }
  );
}

// -------------------- Seed Data (REAL TITLES + REAL ISBNs) --------------------
const booksData = [
  // ---------- Nepali (नेपाली) ----------
  {
    title: 'कर्णाली ब्लुज',
    subtitle: 'उपन्यास',
    authors: 'बुद्धिसागर',
    categories: ['Nepali Fiction', 'Novel'],
    summary: 'बाबु–छोराको सम्बन्ध, संघर्ष र स्मृतिहरूको संवेदनशील कथा।',
    descriptionHTML:
      '<p><strong>कर्णाली ब्लुज</strong> नेपाली उपन्यास साहित्यको चर्चित कृति हो। बाबु–छोराको सम्बन्ध, हुर्काइ र जीवनका उतारचढावलाई भावनात्मक ढंगले प्रस्तुत गर्छ।</p>',
    priceMRP: 698,
    priceSale: 649,
    stock: 40,
    publisher: 'FinePrint Books',
    language: 'Nepali',
    binding: 'Paperback',
    pages: 300,
    tags: ['नेपाली उपन्यास', 'कथा', 'स्मृति', 'सम्बन्ध'],
    isbn13: '9789937827935',
    isbn10: '9937827934',
    featured: true,
  },
  {
    title: 'सेतो धरती',
    subtitle: 'उपन्यास',
    authors: 'अमर न्यौपाने',
    categories: ['Nepali Fiction', 'Award Winner'],
    summary: 'बाल-विधवाको जीवनकथा मार्फत समाज, पीडा र समयको चित्र।',
    descriptionHTML:
      '<p><strong>सेतो धरती</strong> मदन पुरस्कार प्राप्त कृति हो। यसले एक बाल-विधवाको जीवन, समाजका कडा परम्परा र समयसँगको संघर्षलाई मार्मिक रूपमा देखाउँछ।</p>',
    priceMRP: 695,
    priceSale: 599,
    stock: 35,
    publisher: 'FinePrint Books',
    language: 'Nepali',
    binding: 'Paperback',
    pages: 373,
    tags: ['मदन पुरस्कार', 'नेपाली साहित्य', 'उपन्यास', 'समाज'],
    isbn13: '9789937856348',
    isbn10: '9937856345',
    featured: true,
  },
  {
    title: 'पल्पसा क्याफे',
    subtitle: 'उपन्यास',
    authors: 'नारायण वाग्ले',
    categories: ['Nepali Fiction', 'Novel'],
    summary: 'युद्ध, यात्रा र मानवीय अनुभवहरूको संवेदनशील कथा।',
    descriptionHTML:
      '<p><strong>पल्पसा क्याफे</strong> नेपाली पाठकहरूबीच अत्यन्त लोकप्रिय उपन्यास हो। यसले युद्धको असर, मानवीय सम्बन्ध र यात्राको अनुभूति कथामार्फत प्रस्तुत गर्छ।</p>',
    priceMRP: 650,
    priceSale: 575,
    stock: 50,
    publisher: 'Nepalaya',
    language: 'Nepali',
    binding: 'Paperback',
    pages: 294,
    tags: ['नेपाली उपन्यास', 'युद्ध', 'यात्रा', 'कथा'],
    // common ISBN found for Nepali edition (real listing)
    isbn13: '9789937905855',
    isbn10: '9937905850',
    featured: false,
  },
  {
    title: 'सुम्निमा',
    subtitle: 'उपन्यास',
    authors: 'बी.पी. कोइराला',
    categories: ['Nepali Literature', 'Classic'],
    summary: 'नेपाली साहित्यको क्लासिक कृति—संस्कृति, सम्बन्ध र विचार।',
    descriptionHTML:
      '<p><strong>सुम्निमा</strong> बी.पी. कोइरालाको चर्चित कृति हो। यसले समाज, संस्कृति र मानवीय सम्बन्धका तहहरूलाई साहित्यिक ढंगले खोल्छ।</p>',
    priceMRP: 395,
    priceSale: 355,
    stock: 45,
    publisher: 'Lipi Books',
    language: 'Nepali',
    binding: 'Paperback',
    pages: 200,
    tags: ['क्लासिक', 'नेपाली साहित्य', 'उपन्यास'],
    isbn13: '9789937896030',
    isbn10: '9937896037',
    featured: false,
  },

  // ---------- English ----------
  {
    title: 'Atomic Habits',
    subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    authors: 'James Clear',
    categories: ['Self-Help', 'Personal Development', 'Productivity'],
    summary:
      'A practical system for building good habits and breaking bad ones—focused on tiny changes that compound into remarkable results.',
    descriptionHTML:
      '<p><strong>Atomic Habits</strong> offers a proven framework for improving every day through small, consistent changes. It focuses on systems over goals and shows how habits compound over time.</p>',
    priceMRP: 1999,
    priceSale: 1699,
    stock: 30,
    publisher: 'Avery',
    language: 'English',
    binding: 'Hardcover',
    pages: 320,
    tags: ['habits', 'productivity', 'self-improvement', 'behavior change'],
    isbn13: '9780735211292',
    isbn10: '0735211299',
    featured: true,
  },
  {
    title: 'Deep Work',
    subtitle: 'Rules for Focused Success in a Distracted World',
    authors: 'Cal Newport',
    categories: ['Productivity', 'Business', 'Self-Help'],
    summary:
      'Learn how to focus deeply and produce better results in less time—without constant distraction.',
    descriptionHTML:
      '<p><strong>Deep Work</strong> argues that the ability to focus without distraction is a superpower. It provides rules and strategies for cultivating deep concentration.</p>',
    priceMRP: 1899,
    priceSale: 1599,
    stock: 25,
    publisher: 'Grand Central Publishing',
    language: 'English',
    binding: 'Paperback',
    pages: 296,
    tags: ['focus', 'productivity', 'work', 'concentration'],
    isbn13: '9781455586691',
    isbn10: '1455586692',
    featured: false,
  },
  {
    title: 'Mindset',
    subtitle: 'The New Psychology of Success',
    authors: 'Carol S. Dweck',
    categories: ['Psychology', 'Personal Development', 'Success'],
    summary:
      'A landmark book on how a growth mindset can unlock learning, resilience, and long-term success.',
    descriptionHTML:
      "<p><strong>Mindset</strong> explains the difference between fixed and growth mindsets—and how shifting the way you think can change how you learn, work, and relate to challenges.</p>",
    priceMRP: 1799,
    priceSale: 1499,
    stock: 28,
    publisher: 'Ballantine Books',
    language: 'English',
    binding: 'Paperback',
    pages: 320,
    tags: ['psychology', 'growth mindset', 'learning', 'achievement'],
    isbn13: '9780345472328',
    isbn10: '0345472322',
    featured: false,
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    subtitle: 'Powerful Lessons in Personal Change',
    authors: 'Stephen R. Covey',
    categories: ['Personal Development', 'Leadership', 'Self-Help'],
    summary:
      'A principle-centered approach to solving personal and professional problems with timeless habits for effectiveness.',
    descriptionHTML:
      '<p><strong>The 7 Habits</strong> is a classic guide to personal and professional effectiveness, focusing on principles like proactivity, prioritization, and synergy.</p>',
    priceMRP: 1999,
    priceSale: 1699,
    stock: 22,
    publisher: 'Simon & Schuster',
    language: 'English',
    binding: 'Paperback',
    pages: 432,
    tags: ['habits', 'effectiveness', 'leadership', 'personal growth'],
    isbn13: '9781451639612',
    isbn10: '1451639619',
    featured: true,
  },
];

// -------------------- Main Seed --------------------
async function seedBooks() {
  try {
    console.log('\nStarting REAL Book Seed Script (NPR + Real Covers)...\n');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    await ensureSafeBookTextIndex();

    const existingCount = await Book.countDocuments();
    console.log(`Found ${existingCount} existing books`);

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (existingCount > 0) {
      await new Promise((resolve) => {
        readline.question('Do you want to delete existing books? (yes/no): ', (answer) => {
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            Book.deleteMany({}).then(() => {
              console.log('Cleared existing books\n');
              resolve();
            });
          } else {
            console.log('Keeping existing books\n');
            resolve();
          }
        });
      });
      readline.close();
    }

    console.log(`Creating ${booksData.length} books...\n`);

    for (let i = 0; i < booksData.length; i++) {
      const bookData = booksData[i];
      console.log(`[${i + 1}/${booksData.length}] Creating: ${bookData.title}`);

      console.log('   Fetching REAL cover (OpenLibrary -> GoogleBooks fallback)...');
      const image = await fetchRealBookCover({
        title: bookData.title,
        isbn13: bookData.isbn13,
        isbn10: bookData.isbn10,
      });

      // Basic sanity check for NPR prices
      if (typeof bookData.priceMRP === 'number' && typeof bookData.priceSale === 'number') {
        if (bookData.priceSale > bookData.priceMRP) {
          console.log(`   priceSale > priceMRP; adjusting sale to MRP for: ${bookData.title}`);
          bookData.priceSale = bookData.priceMRP;
        }
      }

      const book = new Book({
        title: bookData.title,
        subtitle: bookData.subtitle,
        slug: generateSlug(bookData.title),
        authors: bookData.authors,
        categories: bookData.categories,
        summary: bookData.summary,
        descriptionHTML: bookData.descriptionHTML,
        priceMRP: bookData.priceMRP,
        priceSale: bookData.priceSale,
        stock: bookData.stock,
        lowStockThreshold: 5,
        publisher: bookData.publisher,
        language: bookData.language,
        binding: bookData.binding,
        pages: bookData.pages,
        isbn13: bookData.isbn13,
        isbn10: bookData.isbn10,
        sku: generateSKU(),
        // Keep dates reasonable
        publicationDate: new Date(
          2000 + Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        tags: bookData.tags,
        currency: 'NPR',
        featured: bookData.featured,
        images: [
          {
            src: image.src,
            alt: image.alt || bookData.title,
            width: image.width || 800,
            height: image.height || 1200,
          },
        ],
        metaTitle: `${bookData.title} - Buy Online in Nepal`,
        metaDescription: bookData.summary,
      });

      await book.save();
      console.log('   Created successfully');
      console.log(`   Cover: ${image.src}\n`);

      // Small delay to be gentle with cover endpoints
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    console.log('Successfully seeded all books!\n');

    const totalBooks = await Book.countDocuments();
    const featuredBooks = await Book.countDocuments({ featured: true });

    console.log('Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Books: ${totalBooks}`);
    console.log(`Featured Books: ${featuredBooks}`);
    console.log(`Currency: NPR`);
    console.log(`Categories Used: ${[...new Set(booksData.flatMap((b) => b.categories))].length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Seed script completed successfully!\n');
  } catch (error) {
    console.error('\nError seeding books:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
    process.exit(0);
  }
}

seedBooks();
