const express = require("express");

const router = express.Router();

const authcontroller = require("../controllers/auth.controller");
const ratelimiter = require("../middlewares/ratelimiter.middleware")

// Register
router.post("/register",ratelimiter.AuthRateLimiter,authcontroller.registerUser);

// Verify OTP
router.post("/verifyotp",ratelimiter.AuthRateLimiter,authcontroller.verifyOtp);

// Login
router.post("/login",ratelimiter.AuthRateLimiter,authcontroller.loginUser);

// Forgot password - send OTP
router.post("/forgotpassword",ratelimiter.AuthRateLimiter,authcontroller.forgotPassword);

// Verify forgot password OTP
router.post("/verifyforgototp",ratelimiter.AuthRateLimiter,authcontroller.verifyForgotOtp);

// Reset password
router.post("/resetpassword",ratelimiter.AuthRateLimiter,authcontroller.resetPassword);

// Logout - uses the lenient limiter: being locked out of signing out was a
// real defect, and logout must never consume the login quota.
router.post("/logout",ratelimiter.ApiRateLimiter,authcontroller.logoutUser);

// Refresh access token (used by the frontend when a request comes back 401).
// Uses the lenient limiter so refreshing never eats the login quota.
router.post("/refresh",ratelimiter.ApiRateLimiter,authcontroller.refreshAccessToken);

// Current logged in user (called on page load, so it must stay lenient too)
router.get("/me",ratelimiter.ApiRateLimiter,authcontroller.getMe);

// Two-Factor Authentication Routes
// Enable 2FA - send setup OTP
router.post("/enable2fa",ratelimiter.AuthRateLimiter,authcontroller.enable2FA);

// Verify 2FA setup OTP
router.post("/verify2fasetup",ratelimiter.AuthRateLimiter,authcontroller.verify2FASetup);

// Disable 2FA
router.post("/disable2fa",ratelimiter.AuthRateLimiter,authcontroller.disable2FA);

// Verify 2FA login OTP
router.post("/verify2falogin",ratelimiter.AuthRateLimiter,authcontroller.verify2FALogin);

module.exports = router;