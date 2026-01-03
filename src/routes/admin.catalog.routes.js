const router = require('express').Router();
const ctrl = require('../controllers/adminCatalogController');

router.get('/admin/categories', ctrl.categories);
router.post('/admin/categories', ctrl.categories);
router.post('/admin/categories/:id/delete', ctrl.deleteCategory);

router.get('/admin/authors', ctrl.authors);
router.post('/admin/authors', ctrl.authors);
router.post('/admin/authors/:id/delete', ctrl.deleteAuthor);

module.exports = router;

