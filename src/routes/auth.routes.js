const router = require('express').Router();
const authController = require('../controllers/authController');

// Login routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Signup routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// Logout
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Password reset
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

module.exports = router;

