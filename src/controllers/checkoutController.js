const { fromCart, computeTotals } = require('../services/orderService');
const { checkoutLimiter } = require('../middlewares/rateLimit');

exports.getCheckout = (req, res) => {
  const cart = req.session.cart || { items: [] };
  const totals = computeTotals(cart);
  
  // Get user's saved addresses if logged in
  const savedAddresses = req.user?.addresses || [];
  const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0] || null;
  
  res.render('site/checkout', { 
    cart, 
    totals, 
    savedAddresses,
    defaultAddress
  });
};

exports.postCheckout = async (req, res, next) => {
  try {
    const { 
      name, phone, email, address1, address2, city, state, postalCode, country, notes,
      saveAddress, addressLabel, selectedAddressIndex
    } = req.body;
    
    const cart = req.session.cart || { items: [] };
    if (!cart.items.length) return res.status(400).render('site/checkout', { 
      cart, 
      totals: computeTotals(cart), 
      savedAddresses: req.user?.addresses || [],
      defaultAddress: null,
      error: 'Your cart is empty.' 
    });
    
    let shippingAddress = {};
    
    // If user selected a saved address
    if (selectedAddressIndex !== undefined && selectedAddressIndex !== '' && req.user) {
      const addressIndex = parseInt(selectedAddressIndex);
      if (addressIndex >= 0 && addressIndex < req.user.addresses.length) {
        const addr = req.user.addresses[addressIndex];
        shippingAddress = {
          name: addr.fullName,
          phone: addr.phone,
          address1: addr.addressLine1,
          address2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country
        };
      }
    } else {
      // User entered new address
      shippingAddress = { name, phone, address1, address2, city, state, postalCode, country };
    }
    
    // Validate required fields
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address1 || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).render('site/checkout', { 
        cart, 
        totals: computeTotals(cart),
        savedAddresses: req.user?.addresses || [],
        defaultAddress: null,
        error: 'Please fill all required shipping fields.' 
      });
    }
    
    const customer = { 
      name: shippingAddress.name, 
      phone: shippingAddress.phone, 
      email: email || req.user?.email, 
      address1: shippingAddress.address1, 
      address2: shippingAddress.address2, 
      city: shippingAddress.city, 
      state: shippingAddress.state, 
      postalCode: shippingAddress.postalCode, 
      country: shippingAddress.country 
    };
    
    // Create order
    const order = await fromCart(cart, customer, { method: 'COD' }, req.user?._id);
    
    // Save address to user account if requested (and user is logged in and it's a new address)
    if (saveAddress === 'on' && req.user && selectedAddressIndex === undefined) {
      try {
        // Check if this exact address doesn't already exist
        const addressExists = req.user.addresses.some(addr => 
          addr.addressLine1 === address1 && 
          addr.city === city && 
          addr.postalCode === postalCode
        );
        
        if (!addressExists) {
          req.user.addresses.push({
            label: addressLabel || 'Home',
            fullName: name,
            phone: phone,
            addressLine1: address1,
            addressLine2: address2,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            isDefault: req.user.addresses.length === 0 // First address is default
          });
          
          await req.user.save();
          const logger = require('../utils/logger');
          logger.debug({ userId: req.user.id }, 'Address saved to user account');
        }
      } catch (error) {
        const logger = require('../utils/logger');
        logger.error({ err: error, userId: req.user?.id }, 'Error saving address');
        // Don't fail checkout if address save fails
      }
    }
    
    req.session.cart = { items: [] };
    res.redirect(`/order/success/${order.number}`);
  } catch (e) { next(e); }
};

exports.getOrderSuccess = async (req, res) => {
  const Order = require('../models/Order');
  const order = await Order.findOne({ number: req.params.number });
  if (!order) return res.status(404).render('site/404');
  res.render('site/order-success', { order });
};

