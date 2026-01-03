const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const { list, bySlug, getAllCategories } = require('../services/bookService');
const { getPagination } = require('../utils/pagination');
const { breadcrumbJSONLD, buildMeta, productJSONLD } = require('../utils/seo');

exports.getSearch = async (req, res, next) => {
  try {
    const { q, sort } = req.query;
    const filters = {
      q: q, // Pass query to filters for preservation
      category: req.query.category,
      author: req.query.author,
      binding: req.query.binding,
      language: req.query.language,
      condition: req.query.condition,
      priceMin: req.query.min,
      priceMax: req.query.max,
      inStock: req.query.inStock === '1',
      preorder: req.query.preorder === '1',
      hardcover: req.query.hardcover === '1',
      paperback: req.query.paperback === '1',
      rating: req.query.rating
    };
    const { page, perPage, skip, limit } = getPagination(req.query.page, 12);
    const [{ items, total }, categories] = await Promise.all([
      list({ q, filters, sort, page, perPage }),
      getAllCategories()
    ]);
    const meta = buildMeta({ title: `Search${q ? `: ${q}` : ''}` });
    if (req.query.suggest === '1') return res.json({ items: items.slice(0, 5).map(i => ({ title: i.title, slug: i.slug })) });
    res.render('site/search', { meta, q, items, total, page, perPage, sort, filters, categories });
  } catch (e) { next(e); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).render('site/404');
    const { page, perPage } = getPagination(req.query.page, 12);
    const { items, total } = await list({ filters: { category: category._id }, page, perPage });
    const jsonld = breadcrumbJSONLD([
      { name: 'Home', item: '/' },
      { name: category.name, item: `/category/${category.slug}` }
    ]);
    const meta = buildMeta({ title: category.name, description: category.description || '' });
    res.render('site/category', { category, items, total, page, perPage, meta, jsonld });
  } catch (e) { next(e); }
};

exports.getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug });
    if (!author) return res.status(404).render('site/404');
    const { page, perPage } = getPagination(req.query.page, 12);
    const { items, total } = await list({ filters: { author: author._id }, page, perPage });
    const meta = buildMeta({ title: author.name, description: author.bio || '' });
    res.render('site/author', { author, items, total, page, perPage, meta });
  } catch (e) { next(e); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const book = await bySlug(req.params.slug);
    if (!book) return res.status(404).render('site/404');
    
    // Fetch related books based on categories or just get random books
    let related = [];
    if (book.categories && book.categories.length > 0) {
      // Find books with similar categories, excluding current book
      related = await Book.find({
        _id: { $ne: book._id },
        categories: { $in: book.categories }
      }).limit(4);
    }
    
    // If no related books found, get random books
    if (related.length === 0) {
      const totalBooks = await Book.countDocuments({ _id: { $ne: book._id } });
      if (totalBooks > 0) {
        related = await Book.aggregate([
          { $match: { _id: { $ne: book._id } } },
          { $sample: { size: Math.min(4, totalBooks) } }
        ]);
      }
    }
    
    const meta = buildMeta({ title: book.metaTitle || book.title, description: book.metaDescription || book.summary });
    const jsonld = productJSONLD(book);
    res.render('site/product', { book, meta, jsonld, related });
  } catch (e) { next(e); }
};

