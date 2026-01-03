const ensureWishlist = (req) => {
  if (!req.session.wishlist) req.session.wishlist = { items: [] };
  return req.session.wishlist;
};

exports.getWishlist = async (req, res) => {
  const wishlist = ensureWishlist(req);
  const Book = require('../models/Book');
  const items = wishlist.items && wishlist.items.length ? await Book.find({ _id: { $in: wishlist.items } }) : [];
  // Preserve the order of wishlist ids
  const ordered = items.sort((a,b) => wishlist.items.indexOf(String(a._id)) - wishlist.items.indexOf(String(b._id)));
  res.render('site/wishlist', { wishlist, items: ordered });
};

exports.toggleWishlist = (req, res) => {
  const wishlist = ensureWishlist(req);
  const id = req.params.id;
  const exists = wishlist.items.includes(id);
  wishlist.items = exists ? wishlist.items.filter(x => x !== id) : [...wishlist.items, id];
  req.session.wishlist = wishlist;
  res.json({ ok: true, inWishlist: !exists });
};
