const router = require('express').Router();
const wishlist = require('../controllers/wishlistController');

router.get('/wishlist', wishlist.getWishlist);
router.post('/wishlist/:id', wishlist.toggleWishlist);

module.exports = router;

