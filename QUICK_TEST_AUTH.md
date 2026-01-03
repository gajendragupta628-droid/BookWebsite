# 🧪 Quick Test Guide - Authentication & Checkout

## Start the Application

```bash
# Make sure MongoDB is running
# Then start the app
npm start
```

Visit: http://localhost:3000

---

## 🎯 Test Scenarios

### **Scenario 1: Guest Checkout Triggers Auth**

1. **Add items to cart** (without logging in)
   - Browse to any book page
   - Click "Add to Cart"
   - Visit `/cart`

2. **Try to checkout**
   - Click "Proceed to Checkout"
   - ✅ **Auth modal should appear**

3. **Sign up with email**
   - Fill in name, email, password
   - Check "I agree to Terms & Conditions"
   - Click "Create Account"
   - ✅ **Should redirect to /checkout**
   - ✅ **Cart items should be preserved**

---

### **Scenario 2: Buy Now Protection**

1. **Visit any product page**
   - Go to `/book/[any-book-slug]`

2. **Click "Buy Now"** (without logging in)
   - ✅ **Should redirect to /auth/login**
   - ✅ **returnTo parameter should be set**

3. **Login**
   - Use existing account or Google
   - ✅ **Should redirect back to checkout**

---

### **Scenario 3: Session Data Merge**

1. **As a guest**:
   - Add 2-3 books to cart
   - Add 2-3 books to wishlist

2. **Sign up or login**
   - Use the checkout button to trigger auth modal
   - Complete signup/login

3. **Verify merge**:
   - ✅ All cart items should be in your cart
   - ✅ All wishlist items should be in wishlist
   - ✅ Check terminal logs for: `✅ Merged session cart/wishlist with user account`

---

### **Scenario 4: My Account Page**

1. **Navigate to My Account**
   - Click profile icon → "My Account"
   - Or visit `/account`

2. **Test Orders Tab**
   - ✅ Should show your orders (or empty state)
   - Click "View Details" on an order
   - ✅ Should show full order details with progress tracker

3. **Test Wishlist Tab**
   - Click "Wishlist" tab
   - ✅ Should show wishlist items
   - Click "Add to Cart" on item
   - ✅ Should add to cart

4. **Test Settings Tab**
   - Click "Settings" tab
   - Update your name
   - Click "Save Changes"
   - ✅ Should show success message
   - ✅ Name should update in header

---

### **Scenario 5: Google OAuth**

1. **Setup Google OAuth** (if not already):
   - See `SETUP_GOOGLE_AUTH.md`
   - Add credentials to `.env`

2. **Test Google Login**:
   - Click "Proceed to Checkout" (not logged in)
   - Click "Continue with Google"
   - ✅ Should redirect to Google
   - ✅ After auth, should redirect to checkout
   - ✅ Session data should merge

---

### **Scenario 6: Protected Routes**

Test these routes without logging in:

1. `/checkout` → Should redirect to login
2. `/buy/[book-id]` → Should redirect to login
3. `/account` → Should redirect to login
4. `/orders/[order-id]` → Should redirect to login

✅ All should redirect properly and return after login

---

### **Scenario 7: Mobile Experience**

1. **Resize browser to mobile** (< 768px)
   - Or use device emulation

2. **Test mobile navigation**:
   - ✅ Bottom nav should appear
   - ✅ Cart icon shows count
   - ✅ Account icon (if logged in) shows avatar

3. **Test auth modal on mobile**:
   - ✅ Should fit screen perfectly
   - ✅ Forms should be touch-friendly
   - ✅ Close button should work

---

### **Scenario 8: Tab Switching**

1. **Visit `/account?tab=orders`**
   - ✅ Orders tab should be active

2. **Visit `/account?tab=wishlist`**
   - ✅ Wishlist tab should be active

3. **Click different tabs**
   - ✅ URL should update
   - ✅ Content should switch smoothly

---

### **Scenario 9: Order Details**

1. **Complete a test order** (if needed)
   - Add items to cart
   - Checkout
   - Complete order

2. **View order in My Account**
   - Go to Orders tab
   - Click "View Details"

3. **Check order details page**:
   - ✅ Order progress tracker shows status
   - ✅ All items displayed with images
   - ✅ Order summary correct
   - ✅ Delivery information shown
   - ✅ Payment information shown

---

### **Scenario 10: Remember Me**

1. **Login with "Remember me" checked**
   - Use email/password login
   - Check "Remember me"
   - Login

2. **Close browser completely**

3. **Reopen and visit site**
   - ✅ Should still be logged in

---

## 🐛 Common Issues & Fixes

### **Modal doesn't appear**
- Check browser console for JavaScript errors
- Verify `/public/js/app.js` is loading
- Check that `modals.ejs` is included in `base.ejs`

### **Redirect not working**
- Check `req.session.returnTo` is being set
- Verify `redirectTo` field in forms
- Check auth controller logs

### **Session data not merging**
- Check terminal for merge success log
- Verify User model has `cart` and `wishlist` fields
- Check MongoDB user document

### **Google OAuth fails**
- Verify credentials in `.env`
- Check Google Console callback URL
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

### **Orders not showing**
- Verify orders exist in MongoDB (`Order` collection)
- Check `userId` field matches logged-in user
- Check accountController query

---

## ✅ Expected Console Logs

When logging in with session data:
```
✅ Merged session cart/wishlist with user account
```

When accessing protected route:
```
POST /auth/login 302
GET /checkout 200
```

When Google OAuth succeeds:
```
GET /auth/google/callback 302
GET /checkout 200
```

---

## 🎉 Success Criteria

All of these should work:

- ✅ Auth modal appears on checkout
- ✅ Login/signup redirects correctly
- ✅ Session cart/wishlist merges
- ✅ My Account page loads
- ✅ Orders display correctly
- ✅ Order details page works
- ✅ Settings can be updated
- ✅ Protected routes redirect
- ✅ Mobile UI responsive
- ✅ No console errors

---

## 📝 Notes

- First-time users won't have orders (empty state)
- Google OAuth requires setup (see SETUP_GOOGLE_AUTH.md)
- Session data clears after merge
- Order cancel only works for pending/processing orders

---

**Happy Testing! 🚀**

