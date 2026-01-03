# 📦 Order Cancellation & Address Management

## Overview
Complete implementation of order cancellation functionality and comprehensive address management system with checkout integration.

---

## ✨ Features Implemented

### 1. **Order Cancellation** ❌

Users can cancel their orders directly from the order details page.

#### **How It Works:**
1. Navigate to **My Account** → **Orders**
2. Click **"View Details"** on any order
3. If the order is **Pending** or **Processing**, a **"Cancel Order"** button appears
4. Click the button → Confirmation prompt → Order cancelled

#### **Restrictions:**
- ✅ Can cancel: **Pending** and **Processing** orders
- ❌ Cannot cancel: **Shipped**, **Delivered**, or **Cancelled** orders

#### **Implementation Details:**
```javascript
// Route
POST /orders/:id/cancel

// Response
{
  "ok": true,
  "message": "Order cancelled successfully"
}
```

**Files Modified:**
- `src/routes/account.routes.js` - Added cancel route
- `src/controllers/accountController.js` - Implemented `cancelOrder` function
- `src/views/site/order-details.ejs` - Already had the cancel button

---

### 2. **Complete Address Management** 📍

Full CRUD operations for user addresses with My Account integration.

#### **Features:**

##### **Add New Address** ➕
- Click "Add New Address" in Addresses tab
- Beautiful modal form opens
- Fill in details:
  - Label (Home, Office, etc.)
  - Full Name
  - Phone Number
  - Address Line 1 & 2
  - City, State, Postal Code, Country
  - Set as default checkbox
- Save → Address added to account

##### **Edit Address** ✏️
- Click "Edit" on any address
- Same modal opens with pre-filled data
- Make changes → Save
- Address updated

##### **Delete Address** 🗑️
- Click "Delete" on any address
- Confirmation prompt
- Confirmed → Address removed
- If deleted address was default, first remaining address becomes default

##### **Set Default Address** ⭐
- Click "Set as Default" on any address
- Previous default is un-marked
- Selected address becomes new default

#### **API Endpoints:**

```javascript
POST /account/addresses/add           // Add new address
POST /account/addresses/:id/edit      // Edit address
POST /account/addresses/:id/delete    // Delete address
POST /account/addresses/:id/set-default  // Set default
```

**Files Created/Modified:**
- `src/routes/account.routes.js` - Added address routes
- `src/controllers/accountController.js` - Implemented all CRUD functions
- `src/views/site/account.ejs` - Added modal and JavaScript
- `src/models/User.js` - Already had addresses schema

---

### 3. **Smart Checkout with Address Selection** 🛒✨

Completely redesigned checkout page with address management integration.

#### **For Logged-In Users with Saved Addresses:**

1. **Address Selection:**
   - Shows all saved addresses as cards
   - Default address pre-selected
   - Radio button to choose any address
   - Visual highlight on selected address

2. **Default Address Indicator:**
   - "Default" badge on default address
   - Automatically selected on page load

3. **Add New Address During Checkout:**
   - Radio option: "+ Add New Address"
   - Selecting it shows the address form
   - Can save this new address for future

4. **Save Address Option:**
   - Checkbox: "Save this address for future orders"
   - If checked, shows label input
   - Address saved after order placement

#### **For Guest Users or New Addresses:**
- Standard address form
- All fields required for checkout
- If logged in, option to save for future

#### **Smart Form Behavior:**
- When saved address selected → Hide form, remove required attributes
- When "Add New Address" selected → Show form, add required attributes
- Prevents validation errors

#### **Address Auto-Population:**
- User's name and email pre-filled from account
- Phone number pre-filled if available
- Country defaults to "Nepal"

#### **User Knows Exactly What Address:**
- ✅ Selected address is visually highlighted
- ✅ Full address displayed in the card
- ✅ Can easily change before placing order
- ✅ Can see which is default

**Files Modified:**
- `src/controllers/checkoutController.js` - Complete rewrite for address handling
- `src/views/site/checkout.ejs` - Complete UI redesign
- `src/services/orderService.js` - Added userId parameter
- `src/models/Order.js` - Added userId field and status enums

---

## 🎨 User Experience Flow

### **Scenario 1: First-Time Buyer**
1. Adds items to cart
2. Proceeds to checkout (logs in via modal)
3. Fills in delivery address
4. ✅ Checks "Save this address for future orders"
5. Labels it as "Home"
6. Places order
7. **Address is automatically saved to account**

### **Scenario 2: Returning Customer**
1. Adds items to cart
2. Proceeds to checkout (already logged in)
3. **Sees saved addresses**
4. **Default address is pre-selected** ⭐
5. Reviews address → Correct!
6. Places order with one click
7. Fast & easy checkout! 🚀

### **Scenario 3: Delivery to Different Address**
1. User has "Home" address saved
2. Wants to send gift to friend
3. Proceeds to checkout
4. Selects **"+ Add New Address"**
5. Fills in friend's address
6. **Does NOT check "Save address"** (one-time use)
7. Places order
8. Friend's address used, but not saved

### **Scenario 4: Multiple Addresses**
1. User has 3 saved addresses: Home, Office, Parents
2. Proceeds to checkout
3. **Office** is default, pre-selected
4. Changes selection to **Parents** (sending gift)
5. Address card highlights
6. Places order
7. Delivered to parents! 🎁

### **Scenario 5: Address Management**
1. Goes to **My Account** → **Addresses** tab
2. Sees all saved addresses
3. Clicks **"Edit"** on Office address
4. Updates phone number
5. Saves → Address updated
6. Later, deletes old address
7. Sets Home as new default

### **Scenario 6: Order Cancellation**
1. Places order (status: Pending)
2. Changes mind
3. Goes to **My Orders**
4. Clicks **"View Details"**
5. Clicks **"Cancel Order"**
6. Confirms → Order cancelled ✅
7. Status updates to "Cancelled"

---

## 🔧 Technical Implementation

### **Address Selection Logic**

```javascript
// In checkout controller
if (selectedAddressIndex !== undefined && selectedAddressIndex !== '' && req.user) {
  // User selected saved address
  const addr = req.user.addresses[selectedAddressIndex];
  shippingAddress = {
    name: addr.fullName,
    phone: addr.phone,
    address1: addr.addressLine1,
    // ... etc
  };
} else {
  // User entered new address
  shippingAddress = { name, phone, address1, ... };
}
```

### **Save Address After Checkout**

```javascript
// Save address if checkbox checked
if (saveAddress === 'on' && req.user && !selectedAddressIndex) {
  // Check for duplicates
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
      // ... full address
      isDefault: req.user.addresses.length === 0
    });
    
    await req.user.save();
  }
}
```

### **Default Address Handling**

```javascript
// When setting new default
req.user.addresses.forEach(addr => addr.isDefault = false);
req.user.addresses[index].isDefault = true;

// First address is always default
isDefault: req.user.addresses.length === 0
```

### **Order Association with User**

```javascript
// Create order with userId
const order = await Order.create({
  number,
  userId: req.user?._id,  // Link to user account
  items,
  customer,
  // ...
});
```

---

## 📂 File Structure

### **New/Modified Files**

```
src/
  controllers/
    accountController.js          ✅ Added address CRUD + cancel order
    checkoutController.js         ✅ Complete rewrite for addresses
  
  models/
    Order.js                      ✅ Added userId field
    User.js                       ✅ Already had addresses
  
  routes/
    account.routes.js             ✅ Added address & cancel routes
  
  services/
    orderService.js               ✅ Added userId parameter
  
  views/
    site/
      account.ejs                 ✅ Added address modal & JavaScript
      checkout.ejs                ✅ Complete redesign
      order-details.ejs           ✅ Already had cancel button
```

---

## 🚀 How to Use

### **For Users:**

#### **Managing Addresses:**
1. Click profile icon → "My Account"
2. Go to **Addresses** tab
3. Click **"+ Add New Address"**
4. Fill in form → Save
5. Edit/Delete/Set Default as needed

#### **Checkout:**
1. Add items to cart
2. Click "Proceed to Checkout"
3. **If you have saved addresses:**
   - Select one from the list
   - Or click "+ Add New Address"
4. **If no saved addresses:**
   - Fill in the form
   - Check "Save for future" if desired
5. Review order summary
6. Click "Place Order"

#### **Cancel Order:**
1. Go to **My Account** → **Orders**
2. Find the order (must be Pending/Processing)
3. Click "View Details"
4. Click "Cancel Order"
5. Confirm

### **For Developers:**

#### **Check User's Addresses:**
```javascript
const addresses = req.user.addresses;
const defaultAddr = addresses.find(addr => addr.isDefault);
```

#### **Add Address Programmatically:**
```javascript
req.user.addresses.push({
  label: 'Home',
  fullName: 'John Doe',
  phone: '+977 9876543210',
  addressLine1: '123 Main St',
  addressLine2: 'Apt 4B',
  city: 'Kathmandu',
  state: 'Bagmati',
  postalCode: '44600',
  country: 'Nepal',
  isDefault: true
});

await req.user.save();
```

#### **Cancel Order:**
```javascript
const order = await Order.findById(orderId);
if (['pending', 'processing'].includes(order.status)) {
  order.status = 'cancelled';
  await order.save();
}
```

---

## ✅ Benefits

### **For Customers:**
1. **Faster Checkout**: One-click with saved addresses
2. **Multiple Addresses**: Save home, office, parents, etc.
3. **Easy Management**: Add/edit/delete anytime
4. **Visual Clarity**: Always know which address is selected
5. **Flexible**: Can add new address during checkout
6. **Order Control**: Cancel orders before shipping

### **For Business:**
1. **Reduced Cart Abandonment**: Faster checkout process
2. **Better Data Quality**: Saved addresses are accurate
3. **Customer Retention**: Easier repeat purchases
4. **Lower Support Costs**: Fewer wrong-address issues
5. **Order Management**: Users can self-cancel

---

## 🔐 Security & Validation

✅ **Address Privacy**: Only user can see/edit their addresses
✅ **Order Authorization**: Can only cancel own orders
✅ **Status Validation**: Only pending/processing can be cancelled
✅ **Duplicate Prevention**: Checks for duplicate addresses
✅ **Required Fields**: All critical fields validated
✅ **Default Handling**: Always maintains one default

---

## 🧪 Testing Checklist

### **Address Management:**
- [ ] Add new address from account page
- [ ] Edit existing address
- [ ] Delete address
- [ ] Set different address as default
- [ ] Delete default address (first remaining becomes default)
- [ ] Add address with same label

### **Checkout:**
- [ ] Checkout with no saved addresses (new user)
- [ ] Checkout with saved address selected
- [ ] Checkout with "Add New Address"
- [ ] Save new address during checkout
- [ ] Don't save new address during checkout
- [ ] Change selected address before placing order
- [ ] Default address pre-selected

### **Order Cancellation:**
- [ ] Cancel pending order
- [ ] Cancel processing order
- [ ] Try to cancel shipped order (should fail)
- [ ] View cancelled order in orders list
- [ ] Cancel button hidden for non-cancellable orders

### **Integration:**
- [ ] Order shows correct address
- [ ] Order associated with user account
- [ ] Address saved after successful checkout
- [ ] Duplicate addresses not created

---

## 📱 Mobile Responsive

- ✅ Address cards stack on mobile
- ✅ Form switches to single column
- ✅ Modal fits mobile screen
- ✅ Touch-friendly buttons
- ✅ Checkout optimized for mobile

---

## 🎉 Summary

**Complete address and order management system:**

✅ Full CRUD for addresses (Add, Edit, Delete, Set Default)
✅ Beautiful address management modal
✅ Smart checkout with address selection
✅ Default address auto-selected
✅ Save addresses during checkout
✅ Visual address selection with highlights
✅ Order cancellation for pending orders
✅ Orders associated with user accounts
✅ Mobile-responsive design
✅ Duplicate prevention
✅ Secure and validated

**Users now have complete control over their delivery addresses and orders!** 🚀

---

## 📞 Support

Common issues:

**Q: Address not saving during checkout?**
A: Make sure "Save this address" checkbox is checked and you're logged in.

**Q: Can't cancel order?**
A: Only pending/processing orders can be cancelled. Check order status.

**Q: Default address not showing?**
A: Go to Addresses tab → Set one as default.

**Q: Duplicate addresses?**
A: System prevents exact duplicates (same address1, city, postal code).

---

**Built with ❤️ for seamless shopping experience!**

