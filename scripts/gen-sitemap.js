const fs = require('fs');
const path = require('path');
const { connectDB } = require('../src/config/db');
const Book = require('../src/models/Book');
const Category = require('../src/models/Category');
const Author = require('../src/models/Author');

async function run() {
  await connectDB();
  const [books, categories, authors] = await Promise.all([
    Book.find({}, 'slug updatedAt'), Category.find({}, 'slug updatedAt'), Author.find({}, 'slug updatedAt')
  ]);
  const urls = [
    { loc: '/' },
    ...categories.map(c => ({ loc: `/category/${c.slug}`, lastmod: c.updatedAt })),
    ...authors.map(a => ({ loc: `/author/${a.slug}`, lastmod: a.updatedAt })),
    ...books.map(b => ({ loc: `/book/${b.slug}`, lastmod: b.updatedAt }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `\n  <url><loc>${u.loc}</loc>${u.lastmod?`<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>`:''}</url>`).join('') +
    '\n</urlset>';
  fs.writeFileSync(path.join(process.cwd(), 'sitemap.xml'), xml);
  console.log('sitemap.xml generated');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

