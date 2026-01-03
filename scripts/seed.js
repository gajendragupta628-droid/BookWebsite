const { connectDB } = require('../src/config/db');
const { env } = require('../src/config/env');
const { ensureAdmin } = require('../src/services/adminService');
const { slugify } = require('../src/utils/slugify');
const Category = require('../src/models/Category');
const Author = require('../src/models/Author');
const Book = require('../src/models/Book');
const Banner = require('../src/models/Banner');

async function run() {
  await connectDB();
  await ensureAdmin({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });

  const catNames = ['Fiction','Non-fiction','Business','History','Science','Art'];
  const cats = await Promise.all(catNames.map(name => Category.findOneAndUpdate({ slug: slugify(name) }, { name, slug: slugify(name) }, { upsert: true, new: true })));

  // Authors
  const authorNames = ['Jane Doe','John Smith','Ava Brown','Liam Wilson','Sophia Taylor'];
  const authors = await Promise.all(authorNames.map(name => Author.findOneAndUpdate({ slug: slugify(name) }, { name, slug: slugify(name) }, { upsert: true, new: true })));

  // Books
  if (await Book.countDocuments() < 10) {
    const sampleImg = '/public/assets/images/sample.jpg';
    const books = Array.from({ length: 20 }).map((_, i) => ({
      title: `Premium Book ${i+1}`,
      slug: slugify(`Premium Book ${i+1}`),
      authors: [authors[i % authors.length]._id],
      category: cats[i % cats.length]._id,
      priceSale: 10 + i,
      priceMRP: 14 + i,
      stock: (i % 7) + 1,
      images: [{ src: sampleImg, alt: 'Book cover', width: 800, height: 1200 }],
      summary: 'A captivating premium book.',
      featured: i % 3 === 0
    }));
    await Book.insertMany(books);
  }

  // Banners
  if (await Banner.countDocuments() === 0) {
    await Banner.insertMany([
      { title: 'Summer Reading', subtitle: 'Curated picks for sunny days', ctaText: 'Shop now', ctaHref: '/search', image: '/public/assets/images/hero1.jpg', position: 'home-hero', sort: 1 },
      { title: 'Editor’s Picks', subtitle: 'Impeccable choices', ctaText: 'Explore', ctaHref: '/search', image: '/public/assets/images/hero2.jpg', position: 'home-promo', sort: 2 }
    ]);
  }

  console.log('Seeded admin, categories, authors, books, banners');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

