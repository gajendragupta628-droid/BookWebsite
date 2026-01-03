const router = require('express').Router();
const ctrl = require('../controllers/adminBannerController');

router.get('/admin/banners', ctrl.list);
router.post('/admin/banners', ctrl.list);
router.post('/admin/banners/:id/delete', ctrl.delete);

module.exports = router;

