const router = require('express').Router();
const account = require('../controllers/accountController');
const { isAuthenticated } = require('../controllers/authController');

// Only protect account/order routes (router is mounted at '/')
router.use(['/account', '/orders'], isAuthenticated);

// Main account page
router.get('/account', account.getAccount);

// Update profile
router.post('/account/update-profile', account.updateProfile);

// Change password (local accounts)
router.post('/account/change-password', account.changePassword);

// Update preferences
router.post('/account/update-preferences', account.updatePreferences);

// Address management
router.post('/account/addresses/add', account.addAddress);
router.post('/account/addresses/:id/edit', account.editAddress);
router.post('/account/addresses/:id/delete', account.deleteAddress);
router.post('/account/addresses/:id/set-default', account.setDefaultAddress);

// View single order
router.get('/orders/:id', account.getOrder);

// Cancel order
router.post('/orders/:id/cancel', account.cancelOrder);

module.exports = router;
