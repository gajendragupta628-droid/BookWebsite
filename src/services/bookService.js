const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const { slugify } = require('../utils/slugify');
const sanitizeHtml = require('sanitize-html');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const list = async ({ q, filters, sort, page, perPage }) => {
  const query = {};
  
  // Fuzzy search using regex (case-insensitive)
  if (q) {
    const searchRegex = { $regex: q, $options: 'i' };
    query.$or = [
      { title: searchRegex },
      { authors: searchRegex },
      { tags: searchRegex },
      { categories: searchRegex }
    ];
  }
  
  // Category filter
  if (filters?.category) {
    // categories is an array of strings on Book; regex matches any array element
    query.categories = { $regex: `^${escapeRegex(filters.category)}$`, $options: 'i' };
  }
  
  // Author filter
  if (filters?.author) {
    query.authors = { $regex: filters.author, $options: 'i' };
  }
  
  // Binding filters (hardcover/paperback)
  if (filters?.hardcover || filters?.paperback) {
    const bindings = [];
    if (filters.hardcover) bindings.push('Hardcover');
    if (filters.paperback) bindings.push('Paperback');
    if (bindings.length > 0) {
      query.binding = { $in: bindings };
    }
  }
  
  // Language filter
  if (filters?.language) {
    query.language = { $regex: `^${escapeRegex(filters.language)}$`, $options: 'i' };
  }
  
  // Condition filter (assuming you have a condition field)
  if (filters?.condition) {
    query.condition = filters.condition;
  }
  
  // Stock filter
  if (filters?.inStock) {
    query.stock = { $gt: 0 };
  }
  
  // Price range filter
  if (filters?.priceMin || filters?.priceMax) {
    query.priceSale = {};
    if (filters.priceMin) query.priceSale.$gte = Number(filters.priceMin);
    if (filters.priceMax) query.priceSale.$lte = Number(filters.priceMax);
  }
  
  // Rating filter
  if (filters?.rating) {
    query['ratingsAggregate.avg'] = { $gte: Number(filters.rating) };
  }
  
  // Sort options
  const sortMap = {
    relevance: { createdAt: -1 }, // Default to newest for relevance
    newest: { createdAt: -1 },
    'price-low': { priceSale: 1 },
    'price-high': { priceSale: -1 },
    'title-asc': { title: 1 },
    popular: { sales: -1, 'ratingsAggregate.avg': -1 }
  };
  const s = sortMap[sort] || { createdAt: -1 };
  
  const skip = (page - 1) * perPage;
  
  // Execute query
  const [items, total] = await Promise.all([
    Book.find(query)
      .sort(s)
      .skip(skip)
      .limit(perPage),
    Book.countDocuments(query)
  ]);
  
  return { items, total };
};

const createOrUpdate = async (id, payload) => {
  const data = { ...payload };
  if (data.title) data.slug = slugify(data.slug || data.title);
  if (data.descriptionHTML) data.descriptionHTML = sanitizeHtml(data.descriptionHTML);
  if (typeof data.authors === 'string') data.authors = [data.authors];
  const opts = { new: true, upsert: !!id, setDefaultsOnInsert: true };
  if (id) return Book.findByIdAndUpdate(id, data, opts);
  return Book.create(data);
};

const remove = async (id) => {
  return Book.findByIdAndDelete(id);
};

const bySlug = async (slug) => Book.findOne({ slug });
const byId = async (id) => Book.findById(id);

const bulkImport = async (rows, { defaultCurrency = 'USD' } = {}) => {
  const upserts = [];
  for (const r of rows) {
    const title = r.title || r.Title;
    if (!title) continue;
    const slug = slugify(title);
    const priceMRP = Number(r.priceMRP || r.MRP || 0);
    const priceSale = Number(r.priceSale || r.Price || 0);
    const stock = Number(r.stock || r.Stock || 0);
    const isbn13 = r.isbn13 || r.ISBN13;
    const language = r.language || r.Language;
    const binding = r.binding || r.Binding;
    const publisher = r.publisher || r.Publisher;
    const tags = ((r.tags || r.Tags || '') + '').split('|').filter(Boolean);
    // ensure category
    let category = null;
    const catName = r.category || r.Category;
    if (catName) {
      category = await Category.findOneAndUpdate(
        { slug: slugify(catName) },
        { name: catName, slug: slugify(catName) },
        { upsert: true, new: true }
      );
    }
    // ensure authors
    const authorsNames = ((r.authors || r.Authors || '') + '').split('|').filter(Boolean);
    const authors = [];
    for (const name of authorsNames) {
      const a = await Author.findOneAndUpdate(
        { slug: slugify(name) },
        { name, slug: slugify(name) },
        { upsert: true, new: true }
      );
      authors.push(a._id);
    }
    const doc = {
      title, slug, priceMRP, priceSale, stock, isbn13, language, binding, publisher, tags,
      currency: defaultCurrency, category: category?._id, authors
    };
    upserts.push(doc);
  }
  if (upserts.length) {
    for (const d of upserts) {
      await Book.findOneAndUpdate({ slug: d.slug }, d, { upsert: true, new: true });
    }
  }
  return upserts.length;
};

module.exports = { list, createOrUpdate, remove, bySlug, byId, bulkImport };
