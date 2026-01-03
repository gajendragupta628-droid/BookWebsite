const router = require('express').Router();
const ctrl = require('../controllers/adminBookController');
const multer = require('multer');
const csrf = require('csurf');
const { uploader } = require('../services/uploadService');

// Configure multer for multiple file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

// Multiple file upload fields for book images
const bookImageUpload = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 }
]);

router.get('/admin/books', ctrl.list);
router.get('/admin/books/new', ctrl.newForm);
router.post('/admin/books', bookImageUpload, csrf(), ctrl.create);
router.get('/admin/books/:id/edit', ctrl.editForm);
router.post('/admin/books/:id', bookImageUpload, csrf(), ctrl.update);
router.post('/admin/books/:id/delete', ctrl.remove);
router.post('/admin/books/bulk-upload', uploader.single('file'), csrf(), ctrl.bulkUpload);

module.exports = router;
