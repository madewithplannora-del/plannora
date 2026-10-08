const express = require("express");

const router = express.Router();

const vendorcontroller = require("../controllers/vendorprofile.controller");

const ratelimiter = require("../middlewares/ratelimiter.middleware");

const { upload, validateImageSignature } = require("../middlewares/upload.middleware");


// Create vendor profile
router.post("/create", upload.single("profilePicture"), validateImageSignature, vendorcontroller.createVendorProfile);

// Update vendor profile
router.put("/update", ratelimiter.ApiRateLimiter, upload.single("profilePicture"), validateImageSignature, vendorcontroller.updateVendorProfile);

// Delete vendor profile
router.delete("/delete", ratelimiter.ApiRateLimiter, vendorcontroller.deleteVendorProfile);

// Vendor analytics
//router.get("/analytics",ratelimiter.ApiRateLimiter,vendorcontroller.vendorAnalytics);

// Contact click - must be before /:id route to avoid param collision
router.post("/contact/:id", ratelimiter.PublicRateLimiter, vendorcontroller.contactClick);

// Public vendor profile by vendorID
router.get("/vendor/:vendorID", ratelimiter.PublicRateLimiter, vendorcontroller.getVendorProfileByVendorID);

// Public vendor profile - must be last as it's a catch-all :id parameter
router.get("/:id", ratelimiter.PublicRateLimiter, vendorcontroller.getVendorProfile);

module.exports = router;