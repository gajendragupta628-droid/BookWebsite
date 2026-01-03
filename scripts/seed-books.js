#!/usr/bin/env node

/**
 * Seed Books Script
 * Creates realistic motivational and self-help books with Pexels images
 */

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

// Book Schema
const ImageSchema = new mongoose.Schema({
  src: String,
  alt: String,
  width: Number,
  height: Number,
  focal: { type: String }
}, { _id: false });

const RatingsAggregateSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
  avg: { type: Number, default: 0 }
}, { _id: false });

const BookSchema = new mongoose.Schema({
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
  currency: { type: String, default: 'USD' },
  tags: [{ type: String }],
  categories: [{ type: String }],
  summary: String,
  descriptionHTML: String,
  images: [ImageSchema],
  featured: { type: Boolean, default: false },
  ratingsAggregate: RatingsAggregateSchema,
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);

// Pexels API configuration
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

// Helper to fetch book cover images from Pexels
async function fetchPexelsImage(query) {
  if (!PEXELS_API_KEY) {
    console.log('⚠️  No Pexels API key found, using placeholder');
    return {
      src: `https://picsum.photos/seed/${query}/800/1200`,
      alt: query,
      width: 800,
      height: 1200
    };
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: PEXELS_API_KEY
      },
      params: {
        query: query,
        per_page: 1,
        orientation: 'portrait'
      }
    });

    if (response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      return {
        src: photo.src.large,
        alt: query,
        width: photo.width,
        height: photo.height
      };
    }
  } catch (error) {
    console.log(`Error fetching image for "${query}": ${error.message}`);
  }

  // Fallback to placeholder
  return {
    src: `https://picsum.photos/seed/${query}/800/1200`,
    alt: query,
    width: 800,
    height: 1200
  };
}

// Generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();
}

// Generate ISBN-13
function generateISBN13() {
  return '978' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

// Generate ISBN-10
function generateISBN10() {
  return Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

// Generate SKU
function generateSKU(title) {
  const prefix = 'BK';
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${random}`;
}

// Sample book data
const booksData = [
  {
    title: "The Power of Positive Thinking",
    subtitle: "A Practical Guide to Mastering the Problems of Everyday Living",
    authors: "Norman Vincent Peale",
    categories: ["Motivational", "Self-Help", "Personal Development"],
    summary: "A groundbreaking guide that has helped millions overcome life's challenges through the power of faith and positive thinking.",
    descriptionHTML: "<p>Norman Vincent Peale's timeless classic shows you how to use the power of positive thinking to overcome obstacles and achieve your goals. This practical guide offers techniques for building confidence, overcoming fear, and achieving peace of mind.</p><p>Learn how to eliminate negative thoughts, develop a more positive outlook, and harness the incredible power of belief to transform your life.</p>",
    priceMRP: 24.99,
    priceSale: 18.99,
    stock: 50,
    publisher: "Touchstone",
    language: "English",
    binding: "Paperback",
    pages: 256,
    tags: ["positive thinking", "self-help", "personal growth", "motivation"],
    imageQuery: "book success motivation",
    featured: true
  },
  {
    title: "Atomic Habits",
    subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    authors: "James Clear",
    categories: ["Self-Help", "Personal Development", "Productivity"],
    summary: "Transform your life with tiny changes that deliver remarkable results. Learn the science-backed strategies to build lasting habits.",
    descriptionHTML: "<p>No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.</p><p>If you're having trouble changing your habits, the problem isn't you. The problem is your system. Bad habits repeat themselves not because you don't want to change, but because you have the wrong system for change.</p>",
    priceMRP: 29.99,
    priceSale: 23.99,
    stock: 75,
    publisher: "Avery",
    language: "English",
    binding: "Hardcover",
    pages: 320,
    tags: ["habits", "productivity", "self-improvement", "behavior change"],
    imageQuery: "book habits productivity",
    featured: true
  },
  {
    title: "Think and Grow Rich",
    subtitle: "The Landmark Bestseller Now Revised and Updated for the 21st Century",
    authors: "Napoleon Hill",
    categories: ["Success", "Business", "Personal Development"],
    summary: "The all-time classic that has inspired millions to achieve their dreams and build wealth through the power of thought.",
    descriptionHTML: "<p>Think and Grow Rich has been called the 'Granddaddy of All Motivational Literature.' It was the first book to boldly ask, 'What makes a winner?' Napoleon Hill interviewed 500 of the most successful people of his time, including Andrew Carnegie, Thomas Edison, and Henry Ford.</p><p>From his research, Hill distilled the principles of success into this timeless classic that continues to inspire readers to unlock their potential.</p>",
    priceMRP: 19.99,
    priceSale: 14.99,
    stock: 60,
    publisher: "TarcherPerigee",
    language: "English",
    binding: "Paperback",
    pages: 320,
    tags: ["wealth", "success", "mindset", "achievement"],
    imageQuery: "book wealth success",
    featured: true
  },
  {
    title: "The 7 Habits of Highly Effective People",
    subtitle: "Powerful Lessons in Personal Change",
    authors: "Stephen R. Covey",
    categories: ["Personal Development", "Leadership", "Self-Help"],
    summary: "One of the most inspiring and impactful books ever written, offering a holistic approach to solving personal and professional problems.",
    descriptionHTML: "<p>Stephen Covey presents a principle-centered approach for solving personal and professional problems. With penetrating insights and pointed anecdotes, Covey reveals a step-by-step pathway for living with fairness, integrity, service, and human dignity.</p><p>The 7 Habits have become famous and are integrated into everyday thinking by millions. Learn timeless principles that can help you lead a more effective life.</p>",
    priceMRP: 26.99,
    priceSale: 20.99,
    stock: 45,
    publisher: "Free Press",
    language: "English",
    binding: "Paperback",
    pages: 384,
    tags: ["habits", "effectiveness", "leadership", "personal growth"],
    imageQuery: "book leadership success",
    featured: false
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    subtitle: "A Counterintuitive Approach to Living a Good Life",
    authors: "Mark Manson",
    categories: ["Self-Help", "Personal Development", "Philosophy"],
    summary: "A refreshing slap in the face that shows you how to lead a contented, grounded life by caring less about more things.",
    descriptionHTML: "<p>In this generation-defining self-help guide, a superstar blogger cuts through the crap to show us how to stop trying to be 'positive' all the time so that we can truly become better, happier people.</p><p>Mark Manson uses academic research and well-timed poop jokes to explain how we can develop the skills to give fewer f*cks about the things that don't matter.</p>",
    priceMRP: 24.99,
    priceSale: 19.99,
    stock: 80,
    publisher: "HarperOne",
    language: "English",
    binding: "Paperback",
    pages: 224,
    tags: ["philosophy", "self-help", "happiness", "minimalism"],
    imageQuery: "book mindfulness philosophy",
    featured: false
  },
  {
    title: "Can't Hurt Me",
    subtitle: "Master Your Mind and Defy the Odds",
    authors: "David Goggins",
    categories: ["Motivational", "Biography", "Self-Help"],
    summary: "The autobiography of a Navy SEAL, ultra-endurance athlete, and world record holder who shows you how to master your mind and overcome any challenge.",
    descriptionHTML: "<p>David Goggins's life story is one of the most inspiring ever told. From childhood poverty and abuse to Navy SEAL training and ultra-marathons, Goggins proves that the human mind is capable of anything.</p><p>Through his story and practical advice, learn how to callous your mind, push past your limits, and unlock your true potential.</p>",
    priceMRP: 28.99,
    priceSale: 22.99,
    stock: 55,
    publisher: "Lioncrest Publishing",
    language: "English",
    binding: "Hardcover",
    pages: 364,
    tags: ["motivation", "mental toughness", "biography", "resilience"],
    imageQuery: "book mental strength motivation",
    featured: true
  },
  {
    title: "Mindset",
    subtitle: "The New Psychology of Success",
    authors: "Carol S. Dweck",
    categories: ["Psychology", "Personal Development", "Success"],
    summary: "Discover how your mindset shapes your success and learn to develop a growth mindset that opens up a world of possibilities.",
    descriptionHTML: "<p>World-renowned Stanford psychologist Carol Dweck reveals decades of research on why it's not just our abilities and talent that bring us success, but whether we approach them with a fixed or growth mindset.</p><p>Learn how to foster a growth mindset in yourself and others to achieve more than you ever thought possible.</p>",
    priceMRP: 27.99,
    priceSale: 21.99,
    stock: 65,
    publisher: "Ballantine Books",
    language: "English",
    binding: "Paperback",
    pages: 320,
    tags: ["psychology", "growth mindset", "learning", "achievement"],
    imageQuery: "book psychology success",
    featured: false
  },
  {
    title: "The 5 AM Club",
    subtitle: "Own Your Morning, Elevate Your Life",
    authors: "Robin Sharma",
    categories: ["Productivity", "Self-Help", "Personal Development"],
    summary: "Revolutionary morning routine that has helped legendary entrepreneurs, elite athletes and billionaires maximize their potential.",
    descriptionHTML: "<p>Robin Sharma used the early morning hours to elevate his own life. Now he's sharing his proven formula for making the most of your mornings with everyone.</p><p>The 5 AM Club will help you unlock your potential, become the person you've always wanted to be, and lead the life you've always dreamed of living.</p>",
    priceMRP: 25.99,
    priceSale: 19.99,
    stock: 70,
    publisher: "HarperCollins",
    language: "English",
    binding: "Hardcover",
    pages: 336,
    tags: ["morning routine", "productivity", "success habits", "time management"],
    imageQuery: "book morning productivity",
    featured: false
  },
  {
    title: "Grit",
    subtitle: "The Power of Passion and Perseverance",
    authors: "Angela Duckworth",
    categories: ["Psychology", "Success", "Personal Development"],
    summary: "The secret to outstanding achievement is not talent but a blend of passion and persistence that psychologist Angela Duckworth calls 'grit.'",
    descriptionHTML: "<p>Drawing on her own powerful story and insights from psychology, Duckworth shows why many people who are talented, intelligent, and capable don't fulfill their potential—and why the special ones who do have grit.</p><p>Learn how to develop grit in yourself and help others cultivate it to achieve their goals.</p>",
    priceMRP: 27.99,
    priceSale: 22.99,
    stock: 40,
    publisher: "Scribner",
    language: "English",
    binding: "Paperback",
    pages: 352,
    tags: ["perseverance", "success", "psychology", "achievement"],
    imageQuery: "book determination success",
    featured: false
  },
  {
    title: "Deep Work",
    subtitle: "Rules for Focused Success in a Distracted World",
    authors: "Cal Newport",
    categories: ["Productivity", "Business", "Self-Help"],
    summary: "Learn to focus without distraction on cognitively demanding tasks and produce elite-level work in less time.",
    descriptionHTML: "<p>Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.</p><p>Cal Newport provides practical advice and strategies for training your brain to cultivate deep work in your professional life.</p>",
    priceMRP: 26.99,
    priceSale: 20.99,
    stock: 50,
    publisher: "Grand Central Publishing",
    language: "English",
    binding: "Hardcover",
    pages: 296,
    tags: ["focus", "productivity", "work", "concentration"],
    imageQuery: "book focus concentration",
    featured: false
  },
  {
    title: "The Compound Effect",
    subtitle: "Jumpstart Your Income, Your Life, Your Success",
    authors: "Darren Hardy",
    categories: ["Success", "Personal Development", "Business"],
    summary: "Small, smart choices + consistency + time = radical difference. Learn how to multiply your success through the compound effect.",
    descriptionHTML: "<p>The Compound Effect is based on the principle that decisions shape your destiny. Little, everyday decisions will either take you to the life you desire or to disaster by default.</p><p>Darren Hardy reveals the core principles that drive success, showing you how small, consistent actions compound over time to create extraordinary results.</p>",
    priceMRP: 22.99,
    priceSale: 17.99,
    stock: 55,
    publisher: "Vanguard Press",
    language: "English",
    binding: "Paperback",
    pages: 192,
    tags: ["success", "habits", "consistency", "achievement"],
    imageQuery: "book success growth",
    featured: false
  },
  {
    title: "The Magic of Thinking Big",
    subtitle: "Set Your Goals High – Then Exceed Them",
    authors: "David J. Schwartz",
    categories: ["Motivational", "Success", "Personal Development"],
    summary: "Millions have learned the secrets of success through The Magic of Thinking Big. Learn practical ways to achieve your goals and dreams.",
    descriptionHTML: "<p>David Schwartz provides practical, tried-and-true advice and examples that can help you think creatively, grow your dreams, and take charge of your success.</p><p>The Magic of Thinking Big gives you useful methods, not empty promises. It proves that you don't need innate talent—all you need to do is learn to think differently.</p>",
    priceMRP: 18.99,
    priceSale: 14.99,
    stock: 45,
    publisher: "Touchstone",
    language: "English",
    binding: "Paperback",
    pages: 320,
    tags: ["thinking big", "success", "goals", "achievement"],
    imageQuery: "book ambition success",
    featured: false
  },
  {
    title: "Daring Greatly",
    subtitle: "How the Courage to Be Vulnerable Transforms the Way We Live, Love, Parent, and Lead",
    authors: "Brené Brown",
    categories: ["Psychology", "Self-Help", "Personal Development"],
    summary: "Research professor Brené Brown explores vulnerability, courage, authenticity, and shame in this groundbreaking work.",
    descriptionHTML: "<p>Based on twelve years of pioneering research, Brené Brown dispels the cultural myth that vulnerability is weakness and reveals that it is, in truth, our most accurate measure of courage.</p><p>Learn how embracing vulnerability can transform your relationships, work, and way of living.</p>",
    priceMRP: 25.99,
    priceSale: 19.99,
    stock: 60,
    publisher: "Avery",
    language: "English",
    binding: "Paperback",
    pages: 320,
    tags: ["vulnerability", "courage", "authenticity", "psychology"],
    imageQuery: "book courage vulnerability",
    featured: true
  },
  {
    title: "The One Thing",
    subtitle: "The Surprisingly Simple Truth Behind Extraordinary Results",
    authors: "Gary Keller, Jay Papasan",
    categories: ["Productivity", "Business", "Success"],
    summary: "Learn to cut through the clutter, achieve better results in less time, and build a more meaningful life by focusing on The ONE Thing.",
    descriptionHTML: "<p>YOU WANT LESS. You want fewer distractions and less on your plate. The daily barrage of e-mails, texts, tweets, messages, and meetings distract you and stress you out.</p><p>The ONE Thing teaches you the surprisingly simple truth behind extraordinary results in every area of your life: work, personal, family, and spiritual.</p>",
    priceMRP: 24.99,
    priceSale: 18.99,
    stock: 70,
    publisher: "Bard Press",
    language: "English",
    binding: "Hardcover",
    pages: 240,
    tags: ["focus", "productivity", "success", "priorities"],
    imageQuery: "book focus priority",
    featured: false
  },
  {
    title: "Start With Why",
    subtitle: "How Great Leaders Inspire Everyone to Take Action",
    authors: "Simon Sinek",
    categories: ["Leadership", "Business", "Motivational"],
    summary: "Discover the framework for building inspiring movements based on the concept of starting with why.",
    descriptionHTML: "<p>Simon Sinek's recent video on 'The Millennial Question' went viral with over 150 million views. Start with Why is a global phenomenon and the subject of the third most watched TED Talk of all time.</p><p>Learn why some people and organizations are more innovative, influential and profitable than others, and how great leaders inspire action.</p>",
    priceMRP: 27.99,
    priceSale: 21.99,
    stock: 55,
    publisher: "Portfolio",
    language: "English",
    binding: "Paperback",
    pages: 256,
    tags: ["leadership", "purpose", "inspiration", "business"],
    imageQuery: "book leadership inspiration",
    featured: true
  },
  {
    title: "The Four Agreements",
    subtitle: "A Practical Guide to Personal Freedom",
    authors: "Don Miguel Ruiz",
    categories: ["Spirituality", "Self-Help", "Personal Development"],
    summary: "Based on ancient Toltec wisdom, The Four Agreements offer a powerful code of conduct that can rapidly transform your life.",
    descriptionHTML: "<p>In The Four Agreements, don Miguel Ruiz reveals the source of self-limiting beliefs that rob us of joy and create needless suffering.</p><p>Based on ancient Toltec wisdom, this book offers four agreements as a path to personal freedom: Be Impeccable With Your Word, Don't Take Anything Personally, Don't Make Assumptions, Always Do Your Best.</p>",
    priceMRP: 16.99,
    priceSale: 12.99,
    stock: 65,
    publisher: "Amber-Allen Publishing",
    language: "English",
    binding: "Paperback",
    pages: 160,
    tags: ["spirituality", "wisdom", "personal freedom", "toltec"],
    imageQuery: "book spiritual wisdom",
    featured: false
  }
];

async function seedBooks() {
  try {
    console.log('\n📚 Starting Book Seed Script...\n');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing books (optional)
    const existingCount = await Book.countDocuments();
    console.log(`Found ${existingCount} existing books`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    if (existingCount > 0) {
      await new Promise((resolve) => {
        readline.question('Do you want to delete existing books? (yes/no): ', (answer) => {
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            Book.deleteMany({}).then(() => {
              console.log('✅ Cleared existing books\n');
              resolve();
            });
          } else {
            console.log('⏭️  Keeping existing books\n');
            resolve();
          }
        });
      });
      readline.close();
    }

    console.log(`Creating ${booksData.length} books...\n`);

    // Create books
    for (let i = 0; i < booksData.length; i++) {
      const bookData = booksData[i];
      
      console.log(`[${i + 1}/${booksData.length}] Creating: ${bookData.title}`);

      // Fetch image from Pexels
      console.log(`   → Fetching image from Pexels...`);
      const image = await fetchPexelsImage(bookData.imageQuery);
      
      // Create book
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
        isbn13: generateISBN13(),
        isbn10: generateISBN10(),
        sku: generateSKU(bookData.title),
        publicationDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        tags: bookData.tags,
        currency: 'USD',
        featured: bookData.featured,
        images: [{
          src: image.src,
          alt: bookData.title,
          width: image.width,
          height: image.height
        }],
        metaTitle: `${bookData.title} - Buy Online`,
        metaDescription: bookData.summary
      });

      await book.save();
      console.log(`   ✅ Created successfully\n`);

      // Small delay to avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎉 Successfully seeded all books!\n');
    
    // Summary
    const totalBooks = await Book.countDocuments();
    const featuredBooks = await Book.countDocuments({ featured: true });
    
    console.log('Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Books: ${totalBooks}`);
    console.log(`Featured Books: ${featuredBooks}`);
    console.log(`Categories Used: ${[...new Set(booksData.flatMap(b => b.categories))].length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Seed script completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error seeding books:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the seed script
seedBooks();

