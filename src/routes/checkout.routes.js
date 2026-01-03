const router = require('express').Router();
const checkout = require('../controllers/checkoutController');
const { checkoutLimiter } = require('../middlewares/rateLimit');
const { isAuthenticated } = require('../controllers/authController');

// All checkout routes require authentication
router.get('/checkout', isAuthenticated, checkout.getCheckout);
router.post('/checkout', isAuthenticated, checkoutLimiter, checkout.postCheckout);
router.get('/order/success/:number', isAuthenticated, checkout.getOrderSuccess);

module.exports = router;

