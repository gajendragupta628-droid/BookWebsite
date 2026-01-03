const router = require('express').Router();
const ctrl = require('../controllers/adminHomeController');
const { adminAuthRequired } = require('../middlewares/auth');
const { attachCSRFToken } = require('../middlewares/csrf');

// All routes require admin authentication
router.use(adminAuthRequired);
router.use(attachCSRFToken);

router.get('/admin/home/settings', ctrl.getSettings);
router.post('/admin/home/sections/:sectionId', ctrl.updateSection);
router.post('/admin/home/sections/:sectionId/reorder', ctrl.reorderBooks);
router.get('/admin/home/books', ctrl.getBooksForSection);

module.exports = router;

