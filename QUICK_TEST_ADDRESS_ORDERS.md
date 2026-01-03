# 🧪 Quick Test Guide - Address & Order Management

## 🚀 Start Testing

```bash
npm start
# Visit: http://localhost:3000
```

---

## 📋 Test Scenarios

### **Test 1: Add Address from Account** 📍

1. **Login to your account**
   - If no account, sign up first

2. **Go to My Account**
   - Click profile icon → "My Account"
   - Or visit `/account`

3. **Navigate to Addresses tab**
   - Click "Addresses" tab

4. **Add new address**
   - Click **"+ Add New Address"**
   - ✅ Modal should open

5. **Fill in the form**:
   ```
   Label: Home
   Full Name: John Doe
   Phone: +977 9876543210
   Address Line 1: 123 Main Street
   Address Line 2: Apartment 4B
   City: Kathmandu
   State: Bagmati
   Postal Code: 44600
   Country: Nepal
   ☑️ Set as default address
   ```

6. **Click "Save Address"**
   - ✅ Modal closes
   - ✅ Page reloads
   - ✅ New address appears in list
   - ✅ "Default" badge shown

**Expected Result:** Address saved successfully! ✅

---

### **Test 2: Edit Address** ✏️

1. **In Addresses tab**
   - Find your saved address

2. **Click "Edit"**
   - ✅ Modal opens with pre-filled data

3. **Make changes**:
   - Change phone: `+977 9800000000`
   - Change address line 2: `Suite 5C`

4. **Click "Save Address"**
   - ✅ Address updated

**Expected Result:** Changes saved! ✅

---

### **Test 3: Add Multiple Addresses** 📦

1. **Add second address**:
   ```
   Label: Office
   Full Name: John Doe
   Phone: +977 9876543210
   Address Line 1: Tech Park Building
   City: Lalitpur
   State: Bagmati
   Postal Code: 44700
   Country: Nepal
   ☐ Set as default (uncheck)
   ```

2. **Save**
   - ✅ Now you have 2 addresses
   - ✅ First one still shows "Default"

**Expected Result:** Multiple addresses saved! ✅

---

### **Test 4: Set Different Default** ⭐

1. **On your second address**
   - Click **"Set as Default"**

2. **Watch the change**
   - ✅ Confirmation (or just reloads)
   - ✅ Second address now shows "Default"
   - ✅ First address no longer shows "Default"

**Expected Result:** Default changed! ✅

---

### **Test 5: Delete Address** 🗑️

1. **Add a third address** (temporary)
   ```
   Label: Test Address
   Full Name: Test User
   Phone: +977 9999999999
   Address Line 1: Test Street
   City: Bhaktapur
   Postal Code: 44800
   Country: Nepal
   ```

2. **Delete it**
   - Click **"Delete"**
   - ✅ Confirmation prompt
   - Confirm

3. **Result**
   - ✅ Address removed from list
   - ✅ Other addresses unaffected

**Expected Result:** Address deleted! ✅

---

### **Test 6: Checkout with Saved Address** 🛒

1. **Add items to cart**
   - Browse books
   - Add 2-3 to cart

2. **Go to checkout**
   - Click "Proceed to Checkout"

3. **See your saved addresses**
   - ✅ Both addresses shown as cards
   - ✅ Default address is pre-selected (radio checked)
   - ✅ Selected address is highlighted

4. **Review selected address**
   - Read the full address in the card
   - ✅ You can see exactly where it will be delivered

5. **Change selection** (optional)
   - Click on different address radio button
   - ✅ Highlight changes
   - ✅ Form stays hidden

6. **Place order**
   - Review order summary
   - Click "Place Order"
   - ✅ Order placed successfully
   - ✅ Selected address was used

**Expected Result:** Fast checkout with saved address! ✅

---

### **Test 7: Add New Address During Checkout** ➕

1. **Start checkout**
   - Add items → Checkout

2. **Select "+ Add New Address"**
   - Click the radio button with "+"
   - ✅ Address form appears

3. **Fill in new address**:
   ```
   Full Name: Jane Doe
   Phone: +977 9811111111
   Email: jane@example.com (optional)
   Address Line 1: 456 Park Avenue
   City: Pokhara
   State: Gandaki
   Postal Code: 33700
   Country: Nepal
   ```

4. **Save for future**
   - ☑️ Check "Save this address for future orders"
   - ✅ Label input appears
   - Enter label: `Sister's House`

5. **Place order**
   - Click "Place Order"
   - ✅ Order placed

6. **Verify address saved**
   - Go to My Account → Addresses
   - ✅ New address "Sister's House" is there!

**Expected Result:** New address added and saved! ✅

---

### **Test 8: Guest Checkout (No Saved Addresses)** 👤

1. **Create new account OR use account with no addresses**

2. **Go to checkout**
   - ✅ No saved addresses section shown
   - ✅ Address form is visible by default

3. **Fill in form**
   - Enter all details

4. **Optional: Save address**
   - If logged in, can check "Save for future"

5. **Place order**
   - ✅ Order placed successfully

**Expected Result:** Standard checkout works! ✅

---

### **Test 9: View Order** 📋

1. **Go to My Orders**
   - My Account → Orders tab

2. **See your recent order**
   - ✅ Order appears in list
   - ✅ Status shows (Pending/Processing/etc.)

3. **Click "View Details"**
   - ✅ Full order details page

4. **Check delivery information**
   - ✅ Correct address shown
   - ✅ All order items listed
   - ✅ Progress tracker displayed

**Expected Result:** Order details displayed! ✅

---

### **Test 10: Cancel Order** ❌

1. **On order details page**
   - Must be a Pending or Processing order

2. **Find "Cancel Order" button**
   - ✅ Button is visible (red)

3. **Click "Cancel Order"**
   - ✅ Confirmation prompt appears
   - Click "OK"

4. **Check status**
   - ✅ Success message
   - ✅ Page reloads
   - ✅ Status changed to "Cancelled"
   - ✅ Cancel button now hidden

5. **Go back to orders list**
   - ✅ Order shows as "Cancelled"

**Expected Result:** Order cancelled successfully! ✅

---

### **Test 11: Cannot Cancel Shipped Order** 🚫

1. **Create order and manually change status in MongoDB**:
   ```javascript
   // In MongoDB Compass or shell
   db.orders.updateOne(
     { _id: ObjectId("...") },
     { $set: { status: "shipped" } }
   )
   ```

2. **View order details**
   - ✅ Status shows "Shipped"
   - ✅ Cancel button is HIDDEN

3. **Try to cancel via API** (if curious):
   ```javascript
   POST /orders/ORDER_ID/cancel
   // Should return error: "Cannot cancel order with status: shipped"
   ```

**Expected Result:** Cannot cancel shipped orders! ✅

---

## 🎯 Quick Checks

### **Address Modal:**
- [ ] Opens smoothly
- [ ] Pre-fills data when editing
- [ ] Form validates required fields
- [ ] Saves successfully
- [ ] Closes after save

### **Checkout Page:**
- [ ] Shows saved addresses (if any)
- [ ] Default address pre-selected
- [ ] Selected address is highlighted
- [ ] Can switch between addresses
- [ ] "+ Add New Address" works
- [ ] Form appears/disappears correctly
- [ ] "Save address" checkbox works
- [ ] Order places successfully

### **My Orders:**
- [ ] Shows all orders
- [ ] Can click "View Details"
- [ ] Progress tracker accurate
- [ ] Correct delivery address shown
- [ ] Cancel button only on pending/processing

### **Order Cancellation:**
- [ ] Works for pending orders
- [ ] Works for processing orders
- [ ] Hidden for shipped/delivered
- [ ] Status updates correctly

---

## 🐛 Common Issues & Fixes

### **Modal doesn't open**
- Check browser console for errors
- Verify JavaScript loaded
- Check `account.ejs` has modal HTML

### **Address not saving during checkout**
- Ensure "Save address" is checked
- Verify you're logged in
- Check server logs for errors

### **Duplicate addresses created**
- System should prevent exact duplicates
- Check console logs for duplicate prevention

### **Cancel order fails**
- Check order status (must be pending/processing)
- Verify you own the order
- Check server logs

### **Default address issues**
- First address is always default
- Only one can be default at a time
- Deleting default promotes first remaining

---

## ✅ Success Indicators

All of these should work:

- ✅ Add/Edit/Delete addresses
- ✅ Set default address
- ✅ Checkout with saved address
- ✅ Add new address during checkout
- ✅ Save address from checkout
- ✅ View orders
- ✅ Cancel pending orders
- ✅ Cannot cancel shipped orders
- ✅ Address management modal works
- ✅ Mobile responsive

---

## 📝 Test Data

Use these for testing:

**Test Address 1 (Home):**
```
Full Name: John Doe
Phone: +977 9876543210
Address Line 1: 123 Main Street
City: Kathmandu
Postal Code: 44600
Country: Nepal
```

**Test Address 2 (Office):**
```
Full Name: John Doe
Phone: +977 9876543210
Address Line 1: Tech Park Building, Level 5
City: Lalitpur
Postal Code: 44700
Country: Nepal
```

**Test Address 3 (Parents):**
```
Full Name: Jane Doe (Mother)
Phone: +977 9811111111
Address Line 1: 789 Garden Road
City: Pokhara
Postal Code: 33700
Country: Nepal
```

---

## 🔍 What to Look For

### **Visual Checks:**
- ✅ Address cards look good
- ✅ Selected address is clearly highlighted
- ✅ Default badge visible
- ✅ Modal is centered and responsive
- ✅ Forms are clean and organized
- ✅ Buttons have hover effects
- ✅ Mobile layout works

### **Functional Checks:**
- ✅ Radio buttons work
- ✅ Form shows/hides correctly
- ✅ Validation works
- ✅ Save checkbox toggles label input
- ✅ AJAX calls succeed
- ✅ Page reloads after actions

### **Data Checks:**
- ✅ Addresses saved to MongoDB
- ✅ Orders have userId field
- ✅ Order has correct address
- ✅ Default address logic correct

---

## 📊 Expected Console Logs

**When address saved:**
```
✅ Address saved to user account
```

**When order placed with address save:**
```
✅ Address saved to user account
```

**When order cancelled:**
```
✅ Order ORDER_NUMBER cancelled by user
```

---

**Happy Testing! 🎉**

Everything should work smoothly. If you encounter any issues, check the documentation or console logs for details.

