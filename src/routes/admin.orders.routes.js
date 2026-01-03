const router = require('express').Router();
const ctrl = require('../controllers/adminOrderController');
const settingsCtrl = require('../controllers/adminSettingsController');

router.get('/admin', ctrl.dashboard);
router.get('/admin/orders', ctrl.list);
router.get('/admin/orders/export.csv', ctrl.exportCSV);
router.get('/admin/orders/:id', ctrl.view);
router.post('/admin/orders/:id/status', ctrl.updateStatus);

// Settings routes
router.get('/admin/settings', settingsCtrl.getSettings);
router.post('/admin/settings/change-password', settingsCtrl.changePassword);

// Admin user management
router.get('/admin/admins', settingsCtrl.listAdmins);
router.post('/admin/admins', settingsCtrl.createAdmin);
router.post('/admin/admins/:id/delete', settingsCtrl.deleteAdmin);

module.exports = router;
