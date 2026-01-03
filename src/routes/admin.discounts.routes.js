const router = require('express').Router();
const ctrl = require('../controllers/adminDiscountController');

router.get('/admin/discounts', ctrl.list);
router.post('/admin/discounts', ctrl.list);
router.post('/admin/discounts/:id/delete', ctrl.delete);

module.exports = router;

