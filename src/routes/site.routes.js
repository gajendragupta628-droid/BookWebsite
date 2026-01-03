const router = require('express').Router();
const site = require('../controllers/siteController');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');

router.get('/', site.getHome);
router.get('/about', site.getAbout);
router.get('/contact', site.getContact);
router.get('/policies', site.getPolicies);

// sitemap.xml
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const [books, categories, authors] = await Promise.all([
      Book.find({}, 'slug updatedAt'),
      Category.find({}, 'slug updatedAt'),
      Author.find({}, 'slug updatedAt')
    ]);
    const urls = [
      { loc: '/', lastmod: new Date() },
      ...categories.map(c => ({ loc: `/category/${c.slug}`, lastmod: c.updatedAt })),
      ...authors.map(a => ({ loc: `/author/${a.slug}`, lastmod: a.updatedAt })),
      ...books.map(b => ({ loc: `/book/${b.slug}`, lastmod: b.updatedAt }))
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map(u => `\n  <url><loc>${req.protocol}://${req.get('host')}${u.loc}</loc><lastmod>${new Date(u.lastmod).toISOString()}</lastmod></url>`).join('') +
      '\n</urlset>';
    res.type('application/xml').send(xml);
  } catch (e) { next(e); }
});

module.exports = router;

