const Book = require('../models/Book');
const { formatPrice } = require('../utils/price');

const ensureCart = (req) => {
  if (!req.session.cart) req.session.cart = { items: [] };
  return req.session.cart;
};

const miniCart = (cart) => {
  const count = cart.items.reduce((n, it) => n + it.qty, 0);
  const subtotal = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
  return { count, subtotal, formatted: formatPrice(subtotal) };
};

exports.getCart = async (req, res) => {
  const cart = ensureCart(req);
  // Fetch full book details for each cart item to get current stock
  const bookIds = cart.items.map(it => it.bookId);
  const books = await Book.find({ _id: { $in: bookIds } });
  
  // Enrich cart items with current stock info
  const enrichedItems = cart.items.map(item => {
    const book = books.find(b => String(b._id) === item.bookId);
    return {
      ...item,
      stock: book ? book.stock : 0
    };
  });
  
  res.render('site/cart', { cart: { ...cart, items: enrichedItems } });
};

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, qty } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(400).json({ error: 'Invalid book' });
    const cart = ensureCart(req);
    const line = cart.items.find(it => it.bookId === String(book._id));
    const q = Math.max(1, parseInt(qty || '1', 10));
    if (line) {
      line.qty = Math.min(q, Math.max(1, book.stock));
      line.stock = book.stock; // Update stock info
    } else {
      cart.items.push({
        bookId: String(book._id),
        title: book.title,
        price: book.priceSale,
        qty: Math.min(q, Math.max(1, book.stock)),
        sku: book.sku || '',
        slug: book.slug,
        image: (book.images && book.images[0] && book.images[0].src) || '',
        stock: book.stock // Include stock info
      });
    }
    req.session.cart = cart;
    res.json({ ok: true, miniCart: miniCart(cart) });
  } catch (e) { next(e); }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { lines } = req.body;
    const cart = ensureCart(req);
    for (const l of lines || []) {
      const book = await Book.findById(l.bookId);
      if (!book) continue;
      const line = cart.items.find(it => it.bookId === String(l.bookId));
      if (line) line.qty = Math.min(Math.max(1, parseInt(l.qty || '1', 10)), Math.max(1, book.stock));
    }
    req.session.cart = cart;
    res.json({ ok: true, miniCart: miniCart(cart) });
  } catch (e) { next(e); }
};

exports.removeFromCart = (req, res) => {
  const cart = ensureCart(req);
  cart.items = cart.items.filter(it => it.bookId !== req.body.bookId);
  req.session.cart = cart;
  res.json({ ok: true, miniCart: miniCart(cart) });
};

exports.buyNow = async (req, res, next) => {
  try {
    const id = req.params.id;
    const q = Math.max(1, parseInt(req.query.qty || '1', 10));
    const book = await Book.findById(id);
    if (!book) return res.status(404).render('site/404');
    const qty = Math.min(q, Math.max(1, book.stock));
    req.session.cart = {
      items: [{
        bookId: String(book._id),
        title: book.title,
        price: book.priceSale,
        qty,
        sku: book.sku || '',
        slug: book.slug,
        image: (book.images && book.images[0] && book.images[0].src) || '',
        stock: book.stock // Include stock info
      }]
    };
    res.redirect('/checkout');
  } catch (e) { next(e); }
};
