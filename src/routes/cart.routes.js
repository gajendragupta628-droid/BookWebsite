const router = require('express').Router();
const cart = require('../controllers/cartController');
const { isAuthenticated } = require('../controllers/authController');

router.get('/cart', cart.getCart);
router.post('/cart/add', cart.addToCart);
router.post('/cart/update', cart.updateCart);
router.post('/cart/remove', cart.removeFromCart);
// Buy Now requires authentication
router.get('/buy/:id', isAuthenticated, cart.buyNow);

module.exports = router;
