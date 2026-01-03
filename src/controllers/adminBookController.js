const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const { uploadMultipleImages, deleteMultipleImages } = require('../services/cloudinaryService');
const { parseCSVFile, parseXLSXFile } = require('../utils/csv');
const slugify = require('slugify');
const logger = require('../utils/logger');

function parseOptionalNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeBookPayload(rawBody) {
  const bookData = { ...(rawBody || {}) };
  delete bookData._csrf;

  // Numbers
  bookData.priceSale = parseOptionalNumber(bookData.priceSale);
  bookData.priceMRP = parseOptionalNumber(bookData.priceMRP);
  bookData.stock = parseOptionalNumber(bookData.stock);
  bookData.lowStockThreshold = parseOptionalNumber(bookData.lowStockThreshold);
  bookData.pages = parseOptionalNumber(bookData.pages);
  bookData.weightGrams = parseOptionalNumber(bookData.weightGrams);

  // If MRP present but Sale missing, default Sale to MRP
  if (typeof bookData.priceSale === 'undefined' && typeof bookData.priceMRP !== 'undefined') {
    bookData.priceSale = bookData.priceMRP;
  }

  // Handle categories (convert to array if it's a string or array)
  if (bookData.categories) {
    if (typeof bookData.categories === 'string') {
      bookData.categories = [bookData.categories];
    } else if (Array.isArray(bookData.categories)) {
      bookData.categories = bookData.categories.filter((c) => c);
    }
  } else {
    bookData.categories = [];
  }

  // Handle dimensions
  if (bookData.dimensionsL || bookData.dimensionsW || bookData.dimensionsH) {
    bookData.dimensions = {};
    if (bookData.dimensionsL) {
      bookData.dimensions.L = parseOptionalNumber(bookData.dimensionsL) ?? null;
    }
    if (bookData.dimensionsW) {
      bookData.dimensions.W = parseOptionalNumber(bookData.dimensionsW) ?? null;
    }
    if (bookData.dimensionsH) {
      bookData.dimensions.H = parseOptionalNumber(bookData.dimensionsH) ?? null;
    }
    delete bookData.dimensionsL;
    delete bookData.dimensionsW;
    delete bookData.dimensionsH;
  }

  // Handle edition, series, format
  if (bookData.edition) bookData.edition = bookData.edition.trim() || null;
  if (bookData.series) bookData.series = bookData.series.trim() || null;
  if (bookData.format) bookData.format = bookData.format.trim() || null;

  // Handle tags
  if (bookData.tags && typeof bookData.tags === 'string') {
    bookData.tags = bookData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
  }

  // Handle checkbox for featured
  bookData.featured = bookData.featured === 'true';

  return bookData;
}

exports.list = async (req, res) => {
  const q = req.query.q;
  const filter = q ? { $text: { $search: q } } : {};
  const books = await Book.find(filter).limit(50).sort({ createdAt: -1 });
  res.render('admin/books-list', { books, q });
};

exports.newForm = async (req, res) => {
  const [categories, authors] = await Promise.all([
    Category.find().sort({ name: 1 }),
    Author.find().sort({ name: 1 })
  ]);
  res.render('admin/book-form', { book: {}, categories, authors });
};

exports.create = async (req, res, next) => {
  let bookData = {};
  try {
    bookData = normalizeBookPayload(req.body);
    
    // Generate slug from title
    if (bookData.title) {
      bookData.slug = slugify(bookData.title, { lower: true, strict: true }) + '-' + Date.now();
    }

    if (!bookData.priceSale || bookData.priceSale <= 0) {
      req.flash('error', 'Sale price is required (must be greater than 0).');
      const [categories, authors] = await Promise.all([
        Category.find().sort({ name: 1 }),
        Author.find().sort({ name: 1 })
      ]);
      return res.status(400).render('admin/book-form', { book: bookData, categories, authors, csrfToken: req.csrfToken?.() });
    }
    
    // Upload images to Cloudinary
    const imageFiles = [];
    for (let i = 1; i <= 5; i++) {
      if (req.files && req.files[`image${i}`]) {
        imageFiles.push(req.files[`image${i}`][0]);
      }
    }
    
    if (imageFiles.length > 0) {
      try {
        const uploadedImages = await uploadMultipleImages(imageFiles, 'books');
        bookData.images = uploadedImages.map((img) => ({
          src: img.src,
          alt: bookData.title || 'Book image',
          width: img.width,
          height: img.height
        }));
      } catch (err) {
        logger.error({ err }, 'Image upload failed; continuing without images');
        req.flash('error', 'Image upload failed (Cloudinary not configured). Book was saved without images.');
      }
    }
    
    const book = await Book.create(bookData);
    req.flash('success', 'Book created successfully.');
    res.redirect(`/admin/books/${book._id}/edit`);
  } catch (e) { 
    logger.error({ err: e, bookData: { title: bookData?.title || req.body?.title } }, 'Error creating book');
    if (e && e.name === 'ValidationError') {
      req.flash('error', Object.values(e.errors || {}).map((er) => er.message).join(' '));
      const [categories, authors] = await Promise.all([
        Category.find().sort({ name: 1 }),
        Author.find().sort({ name: 1 })
      ]);
      return res.status(400).render('admin/book-form', { book: bookData, categories, authors, csrfToken: req.csrfToken?.() });
    }
    next(e);
  }
};

exports.editForm = async (req, res) => {
  const [book, categories, authors] = await Promise.all([
    Book.findById(req.params.id),
    Category.find().sort({ name: 1 }),
    Author.find().sort({ name: 1 })
  ]);
  if (!book) return res.status(404).render('site/404');
  res.render('admin/book-form', { book, categories, authors });
};

exports.update = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    
    const bookData = normalizeBookPayload(req.body);
    
    // Update slug if title changed
    if (bookData.title && bookData.title !== book.title) {
      bookData.slug = slugify(bookData.title, { lower: true, strict: true }) + '-' + Date.now();
    }
    if (!bookData.priceSale || bookData.priceSale <= 0) {
      req.flash('error', 'Sale price is required (must be greater than 0).');
      return res.redirect(`/admin/books/${book._id}/edit`);
    }
    
    // Upload new images to Cloudinary if provided
    const imageFiles = [];
    for (let i = 1; i <= 5; i++) {
      if (req.files && req.files[`image${i}`]) {
        imageFiles.push(req.files[`image${i}`][0]);
      }
    }
    
    if (imageFiles.length > 0) {
      // Delete old images from Cloudinary if they exist
      if (book.images && book.images.length > 0) {
        const publicIds = book.images
          .map(img => img.src.split('/').slice(-2).join('/').split('.')[0])
          .filter(id => id);
        if (publicIds.length > 0) {
          try {
            await deleteMultipleImages(publicIds);
          } catch (err) {
            logger.error({ err, bookId: req.params.id }, 'Error deleting old images');
          }
        }
      }
      
      // Upload new images
      try {
        const uploadedImages = await uploadMultipleImages(imageFiles, 'books');
        bookData.images = uploadedImages.map((img) => ({
          src: img.src,
          alt: bookData.title || 'Book image',
          width: img.width,
          height: img.height
        }));
      } catch (err) {
        logger.error({ err }, 'Image upload failed; continuing without updating images');
        req.flash('error', 'Image upload failed (Cloudinary not configured). Existing images were kept.');
      }
    }
    
    // Update book
    Object.assign(book, bookData);
    await book.save();
    
    req.flash('success', 'Book updated successfully.');
    res.redirect(`/admin/books/${book._id}/edit`);
  } catch (e) { 
    logger.error({ err: e, bookId: req.params.id }, 'Error updating book');
    next(e); 
  }
};

exports.remove = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    // Delete images from Cloudinary
    if (book.images && book.images.length > 0) {
      const publicIds = book.images
        .map(img => img.src.split('/').slice(-2).join('/').split('.')[0])
        .filter(id => id);
        if (publicIds.length > 0) {
          try {
            await deleteMultipleImages(publicIds);
          } catch (err) {
            logger.error({ err, bookId: req.params.id }, 'Error deleting images');
          }
        }
    }
    await Book.findByIdAndDelete(req.params.id);
  }
  req.flash('success', 'Book deleted.');
  res.redirect('/admin/books');
};

exports.bulkUpload = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send('No file');
    const rows = file.originalname.endsWith('.xlsx') ? parseXLSXFile(file.path) : await parseCSVFile(file.path);
    const { bulkImport } = require('../services/bookService');
    const count = await bulkImport(rows);
    req.flash('success', `Imported ${count} books.`);
    res.redirect('/admin/books');
  } catch (e) { next(e); }
};
