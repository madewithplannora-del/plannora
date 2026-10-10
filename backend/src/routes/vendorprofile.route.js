const express = require("express");
const router = express.Router();
const vendorcontroller = require("../controllers/vendorprofile.controller");
const ratelimiter = require("../middlewares/ratelimiter.middleware");

// Create vendor profile (requires token + vendor role)
router.post("/create", ratelimiter.ApiRateLimiter, vendorcontroller.createVendorProfile);

// Get vendor profile (requires token + vendor role)
router.get("/", ratelimiter.ApiRateLimiter, vendorcontroller.getVendorProfile);

// Update vendor profile (requires token + vendor role)
router.patch("/update", ratelimiter.ApiRateLimiter, vendorcontroller.updateVendorProfile);

// Delete vendor profile (requires token + vendor role)
router.delete("/delete", ratelimiter.ApiRateLimiter, vendorcontroller.deleteVendorProfile);

module.exports = router;
