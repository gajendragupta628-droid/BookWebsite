const User = require('../models/User');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { buildMeta } = require('../utils/seo');
const bcrypt = require('bcryptjs');

// Get account page
exports.getAccount = async (req, res, next) => {
  try {
    const user = req.user;
    const { tab } = req.query;

    // Fetch user's orders
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Fetch wishlist books (if any)
    let wishlistItems = [];
    if (user.wishlist && user.wishlist.items && user.wishlist.items.length > 0) {
      wishlistItems = await Book.find({
        _id: { $in: user.wishlist.items }
      }).limit(10);
    }

    res.render('site/account', {
      meta: buildMeta({ title: 'My Account' }),
      orders,
      wishlistItems,
      activeTab: tab || 'orders'
    });
  } catch (error) {
    const logger = require('../utils/logger');
    logger.error({ err: error, userId: req.user?.id }, 'Account page error');
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.user._id }
      });
      
      if (existingUser) {
        req.flash('error', 'Email is already in use');
        return res.redirect('/account?tab=settings');
      }
    }

    // Update user
    req.user.name = name;
    req.user.email = email.toLowerCase();
    if (phone) req.user.phone = phone;

    await req.user.save();

    req.flash('success', 'Profile updated successfully');
    res.redirect('/account?tab=settings');
  } catch (error) {
    console.error('Update profile error:', error);
    req.flash('error', 'Failed to update profile');
    res.redirect('/account?tab=settings');
  }
};

// Change password (local accounts only)
exports.changePassword = async (req, res, next) => {
  try {
    if (req.user.provider !== 'local') {
      req.flash('error', 'Cannot change password for social accounts');
      return res.redirect('/account?tab=settings');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/account?tab=settings');
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/account?tab=settings');
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    req.flash('success', 'Password changed successfully');
    res.redirect('/account?tab=settings');
  } catch (error) {
    console.error('Change password error:', error);
    req.flash('error', 'Failed to change password');
    res.redirect('/account?tab=settings');
  }
};

// Update preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { newsletter, orderUpdates, recommendations } = req.body;

    req.user.preferences = {
      newsletter: newsletter === 'on',
      orderUpdates: orderUpdates === 'on',
      recommendations: recommendations === 'on'
    };

    await req.user.save();

    req.flash('success', 'Preferences updated successfully');
    res.redirect('/account?tab=settings');
  } catch (error) {
    console.error('Update preferences error:', error);
    req.flash('error', 'Failed to update preferences');
    res.redirect('/account?tab=settings');
  }
};

// Get single order details
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).render('site/404');
    }

    res.render('site/order-details', {
      meta: buildMeta({ title: `Order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}` }),
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }

    // Only allow cancellation for pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        ok: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    order.status = 'cancelled';
    await order.save();

    console.log(`Order ${order.orderNumber} cancelled by user`);

    res.json({ ok: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ ok: false, message: 'Failed to cancel order' });
  }
};

// Add new address
exports.addAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    // If this is set as default, unset all other defaults
    if (isDefault === 'on' || isDefault === true) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    req.user.addresses.push({
      label: label || 'Home',
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'Nepal',
      isDefault: isDefault === 'on' || isDefault === true || req.user.addresses.length === 0
    });

    await req.user.save();

    req.flash('success', 'Address added successfully');
    res.redirect('/account?tab=addresses');
  } catch (error) {
    console.error('Add address error:', error);
    req.flash('error', 'Failed to add address');
    res.redirect('/account?tab=addresses');
  }
};

// Edit address
exports.editAddress = async (req, res, next) => {
  try {
    const addressIndex = parseInt(req.params.id);
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (addressIndex < 0 || addressIndex >= req.user.addresses.length) {
      req.flash('error', 'Address not found');
      return res.redirect('/account?tab=addresses');
    }

    // If this is set as default, unset all other defaults
    if (isDefault === 'on' || isDefault === true) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address
    req.user.addresses[addressIndex] = {
      label: label || 'Home',
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'Nepal',
      isDefault: isDefault === 'on' || isDefault === true
    };

    await req.user.save();

    req.flash('success', 'Address updated successfully');
    res.redirect('/account?tab=addresses');
  } catch (error) {
    console.error('Edit address error:', error);
    req.flash('error', 'Failed to update address');
    res.redirect('/account?tab=addresses');
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const addressIndex = parseInt(req.params.id);

    if (addressIndex < 0 || addressIndex >= req.user.addresses.length) {
      return res.status(404).json({ ok: false, message: 'Address not found' });
    }

    const wasDefault = req.user.addresses[addressIndex].isDefault;

    // Remove address
    req.user.addresses.splice(addressIndex, 1);

    // If the deleted address was default, make the first remaining address default
    if (wasDefault && req.user.addresses.length > 0) {
      req.user.addresses[0].isDefault = true;
    }

    await req.user.save();

    res.json({ ok: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete address' });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const addressIndex = parseInt(req.params.id);

    if (addressIndex < 0 || addressIndex >= req.user.addresses.length) {
      return res.status(404).json({ ok: false, message: 'Address not found' });
    }

    // Unset all defaults
    req.user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set this one as default
    req.user.addresses[addressIndex].isDefault = true;

    await req.user.save();

    res.json({ ok: true, message: 'Default address updated' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ ok: false, message: 'Failed to update default address' });
  }
};
