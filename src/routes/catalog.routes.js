const router = require('express').Router();
const catalog = require('../controllers/catalogController');

router.get('/search', catalog.getSearch);
router.get('/category/:slug', catalog.getCategory);
router.get('/author/:slug', catalog.getAuthor);
router.get('/book/:slug', catalog.getProduct);

module.exports = router;

