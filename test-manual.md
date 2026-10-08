# Plannora Application Manual Test Guide

## Pre-Test Requirements
- ✅ Backend running on http://localhost:3000
- ✅ Frontend running on http://localhost:5174
- ✅ MongoDB connected
- ✅ Email service configured

## Test Scenarios

### 1. USER AUTHENTICATION FLOW

#### 1.1 Client Registration
**Steps:**
1. Go to http://localhost:5174/register
2. Fill form:
   - Username: `testclient_manual`
   - Email: `testclient_manual@test.com`
   - Password: `Test@123456`
   - Role: Client
3. Click Register

**Expected Result:**
- ✅ Message: "OTP sent to email"
- ✅ Redirects to verify-email page
- ✅ OTP input field appears

**Check:**
- Look in console logs for OTP (in development mode it logs)
- MongoDB: Check `otps` collection for record

#### 1.2 Email Verification
**Steps:**
1. Check email or console for OTP (default: 123456 in dev)
2. Enter OTP in verify-email form
3. Click Verify

**Expected Result:**
- ✅ Email verified successfully
- ✅ Redirect to login page

**Check:**
- MongoDB: Check `auths` collection - emailverified should be `true`

#### 1.3 Client Login
**Steps:**
1. On login page, enter:
   - Email: `testclient_manual@test.com`
   - Password: `Test@123456`
2. Click Login

**Expected Result:**
- ✅ Login successful
- ✅ Auth cookie set (visible in DevTools > Application > Cookies)
- ✅ Redirect to dashboard or home

**Check:**
- MongoDB: Check `sessions` or `auths` for active session
- Browser DevTools: Check for `accesstoken` cookie with httpOnly flag

---

### 2. VENDOR PROFILE CREATION & MANAGEMENT

#### 2.1 Vendor Registration
**Steps:**
1. Go to http://localhost:5174/register
2. Fill form:
   - Username: `testvendor_manual`
   - Email: `testvendor_manual@test.com`
   - Password: `Test@123456`
   - Role: Vendor
3. Click Register

**Expected Result:**
- ✅ OTP sent to email
- ✅ Verify email as before

**Check:**
- MongoDB: `auths` collection - `role` should be `"vendor"`

#### 2.2 Create Vendor Profile
**Steps:**
1. Login as vendor
2. Navigate to vendor dashboard (http://localhost:5174/vendor/dashboard)
3. Fill vendor profile form:
   - Business Name: `Amazing Events Co`
   - Contact Number: `9876543210`
   - Bio: `Professional event planning services`
4. Click Create Profile

**Expected Result:**
- ✅ Profile created successfully
- ✅ Message: "Vendor profile created successfully"
- ✅ Profile displayed on page

**Check:**
- MongoDB: `vendorprofiles` collection
  - Should have `BusinessName`, `number`, `bio`
  - Should have `vendorID` referencing the user

#### 2.3 Update Vendor Profile
**Steps:**
1. On vendor dashboard, edit profile
2. Change:
   - Contact Number: `9999999999`
   - Bio: `Updated bio - 10+ years of experience`
3. Click Update

**Expected Result:**
- ✅ Profile updated successfully
- ✅ Changes reflected on page

**Check:**
- MongoDB: Verify updated fields in `vendorprofiles`

#### 2.4 View Vendor Profile (Client Side)
**Steps:**
1. Login as client
2. Go to http://localhost:5174/vendors
3. Find vendor profile
4. Click on vendor card

**Expected Result:**
- ✅ Vendor profile page loads
- ✅ Shows: Business Name, Bio, Contact Number, Logo (if uploaded)
- ✅ Visit counter increments

**Check:**
- MongoDB: `vendorprofiles` - `visit_no` incremented by 1

#### 2.5 Contact Click
**Steps:**
1. On vendor profile page
2. Click "Contact" button

**Expected Result:**
- ✅ Contact click recorded
- ✅ Modal or message shows contact details

**Check:**
- MongoDB: `vendorprofiles` - `contact_clicks` incremented

#### 2.6 Delete Vendor Profile
**Steps:**
1. Login as vendor
2. Go to vendor dashboard
3. Click "Delete Profile"
4. Confirm deletion

**Expected Result:**
- ✅ Profile deleted
- ✅ Redirect to home or dashboard
- ✅ Message: "Profile deleted successfully"

**Check:**
- MongoDB: Record should be deleted from `vendorprofiles`
- `auths` collection: `vendorverified` should be `false`

---

### 3. PASSWORD MANAGEMENT

#### 3.1 Forgot Password
**Steps:**
1. On login page, click "Forgot Password?"
2. Enter email: `testclient_manual@test.com`
3. Click Submit

**Expected Result:**
- ✅ Message: "OTP sent to your email"
- ✅ Redirect to reset verification page

#### 3.2 Verify Reset OTP
**Steps:**
1. Enter OTP (from email or console: 123456)
2. Click Verify

**Expected Result:**
- ✅ OTP verified
- ✅ Redirect to reset password page

#### 3.3 Reset Password
**Steps:**
1. Enter new password: `NewTest@123456`
2. Enter confirm password: `NewTest@123456`
3. Click Reset

**Expected Result:**
- ✅ Password updated successfully
- ✅ Redirect to login
- ✅ Can login with new password

**Check:**
- Try login with old password - should fail with 401
- Try login with new password - should succeed

---

### 4. ERROR HANDLING TESTS

#### 4.1 Invalid Email on Registration
**Steps:**
1. Try register with email: `invalid-email`

**Expected Result:**
- ❌ Error: "Invalid email format"

#### 4.2 Duplicate Email Registration
**Steps:**
1. Try register with email: `testclient_manual@test.com` (already exists)

**Expected Result:**
- ❌ Error: "User already exist"

#### 4.3 Missing Password on Login
**Steps:**
1. Try login with email but no password

**Expected Result:**
- ❌ Error or validation message

#### 4.4 Invalid OTP
**Steps:**
1. Try verify with OTP: `000000`

**Expected Result:**
- ❌ Error: "Invalid OTP"

#### 4.5 Vendor Profile Without Authentication
**Steps:**
1. Try access vendor profile creation without login
2. Send POST to `/api/vendorprofile/create` without token

**Expected Result:**
- ❌ 401 Error: "Access token not found"

---

### 5. FRONTEND INTEGRATION TESTS

#### 5.1 CORS & Proxy Working
**Steps:**
1. Open DevTools > Network tab
2. Perform any API call (login, register, etc.)
3. Check Network tab

**Expected Result:**
- ✅ Requests show path like `/api/...` (via proxy)
- ✅ No CORS errors in console
- ✅ Requests succeed (200 or expected error code)

#### 5.2 Auth Context Working
**Steps:**
1. Login successfully
2. Refresh page (F5)
3. Check if you stay logged in

**Expected Result:**
- ✅ Auth persists after refresh
- ✅ User info loaded on page load
- ✅ No "Network error" messages

#### 5.3 Protected Routes
**Steps:**
1. Logout
2. Try navigate to http://localhost:5174/dashboard

**Expected Result:**
- ✅ Redirected to login page
- ✅ Cannot access protected route without auth

---

### 6. DATABASE INTEGRITY CHECKS

After all tests, verify:

**MongoDB Collections:**
```
1. auths
   - Count: 2+ documents (test client + test vendor)
   - Fields: username, email, emailverified, role, vendorverified

2. otps
   - Should be mostly empty (cleaned up after verification)

3. vendorprofiles
   - Count: 1+ (from vendor profile creation)
   - Fields: BusinessName, number, bio, visit_no, contact_clicks

4. refreshtokens
   - Should have entries from login operations

5. forgototps
   - Should have entries from forgot password tests
```

---

## Summary Checklist

- [ ] Client registration works
- [ ] Email verification works
- [ ] Client login works
- [ ] Vendor registration works
- [ ] Vendor profile creation works
- [ ] Vendor profile update works
- [ ] Vendor profile view works (visit counter)
- [ ] Contact click works
- [ ] Vendor profile delete works
- [ ] Forgot password works
- [ ] Reset password works
- [ ] CORS working properly
- [ ] Auth persists after refresh
- [ ] Protected routes working
- [ ] Error handling working
- [ ] Database integrity maintained
- [ ] No console errors
- [ ] No "Network error" messages

## To Push to GitHub

When all tests pass, run:
```bash
git add .
git commit -m "Feat: Full frontend-backend integration with auth and vendor profiles

- Fixed CORS configuration for localhost development
- Implemented Vite proxy for API requests
- All 15 API endpoints working
- Auth flow: register, verify email, login, refresh token, forgot password
- Vendor profiles: create, read, update, delete
- Database operations verified
- Error handling implemented
- Rate limiting active"
git push origin main
```
