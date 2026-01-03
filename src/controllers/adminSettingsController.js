const { env } = require('../config/env');
const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Get settings page
exports.getSettings = async (req, res) => {
  try {
    const currentAdmin = await AdminUser.findById(req.session.adminUserId);
    const settings = {
      storeName: env.STORE_NAME,
      storeCurrency: env.STORE_CURRENCY,
      baseUrl: env.BASE_URL,
      enableCOD: env.ENABLE_COD,
      // Configuration status
      cloudinaryConfigured: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
      smtpConfigured: !!(env.SMTP_HOST && env.SMTP_USER),
      googleOAuthConfigured: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      pexelsConfigured: !!env.PEXELS_API_KEY
    };
    
    res.render('admin/settings', { 
      settings,
      currentAdmin: currentAdmin ? { email: currentAdmin.email, createdAt: currentAdmin.createdAt } : null
    });
  } catch (error) {
    logger.error({ err: error }, 'Error loading settings');
    res.status(500).send('Error loading settings');
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      req.flash('error', 'All password fields are required');
      return res.redirect('/admin/settings');
    }
    
    if (newPassword.length < 8) {
      req.flash('error', 'New password must be at least 8 characters long');
      return res.redirect('/admin/settings');
    }
    
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/admin/settings');
    }
    
    const admin = await AdminUser.findById(req.session.adminUserId);
    if (!admin) {
      req.flash('error', 'Admin user not found');
      return res.redirect('/admin/settings');
    }
    
    // Verify current password
    const isMatch = await admin.verifyPassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/admin/settings');
    }
    
    // Update password
    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();
    
    logger.info({ adminId: admin._id }, 'Admin password changed');
    req.flash('success', 'Password changed successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    logger.error({ err: error }, 'Error changing admin password');
    req.flash('error', 'Failed to change password');
    res.redirect('/admin/settings');
  }
};

// List all admin users
exports.listAdmins = async (req, res) => {
  try {
    const admins = await AdminUser.find().select('email createdAt').sort({ createdAt: -1 });
    res.render('admin/admins-list', { admins });
  } catch (error) {
    logger.error({ err: error }, 'Error listing admin users');
    req.flash('error', 'Failed to load admin users');
    res.redirect('/admin/settings');
  }
};

// Create new admin user
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    if (!email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required');
      return res.redirect('/admin/admins');
    }
    
    if (!email.includes('@')) {
      req.flash('error', 'Invalid email address');
      return res.redirect('/admin/admins');
    }
    
    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters long');
      return res.redirect('/admin/admins');
    }
    
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/admin/admins');
    }
    
    // Check if admin already exists
    const existing = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash('error', 'Admin with this email already exists');
      return res.redirect('/admin/admins');
    }
    
    // Create admin
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      email: email.toLowerCase().trim(),
      passwordHash
    });
    
    logger.info({ adminId: admin._id, email: admin.email }, 'New admin user created');
    req.flash('success', 'Admin user created successfully');
    res.redirect('/admin/admins');
  } catch (error) {
    logger.error({ err: error }, 'Error creating admin user');
    req.flash('error', 'Failed to create admin user');
    res.redirect('/admin/admins');
  }
};

// Delete admin user
exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Prevent deleting yourself
    if (adminId === req.session.adminUserId) {
      req.flash('error', 'You cannot delete your own account');
      return res.redirect('/admin/admins');
    }
    
    // Check if this is the last admin
    const adminCount = await AdminUser.countDocuments();
    if (adminCount <= 1) {
      req.flash('error', 'Cannot delete the last admin user');
      return res.redirect('/admin/admins');
    }
    
    await AdminUser.findByIdAndDelete(adminId);
    
    logger.info({ adminId, deletedBy: req.session.adminUserId }, 'Admin user deleted');
    req.flash('success', 'Admin user deleted successfully');
    res.redirect('/admin/admins');
  } catch (error) {
    logger.error({ err: error }, 'Error deleting admin user');
    req.flash('error', 'Failed to delete admin user');
    res.redirect('/admin/admins');
  }
};

