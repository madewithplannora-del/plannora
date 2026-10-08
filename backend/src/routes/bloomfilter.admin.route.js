const express = require("express");
const router = express.Router();
const { emailBloomFilter, usernameBloomFilter, vendorEmailBloomFilter } = require("../utils/bloomfilter");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const authdatabase = require("../models/auth.model");
const vendormodel = require("../models/vendorprofile.model");

require("dotenv").config();

/**
 * Middleware to check if user is admin (optional, can customize based on your auth system)
 */
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.accesstoken;
        if (!token) {
            return res.status(401).json({ message: "Access token not found" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await authdatabase.findById(decoded.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Error verifying admin" });
    }
};

/**
 * GET /api/bloomfilter/stats
 * Get bloom filter statistics
 */
router.get("/stats", verifyAdmin, (req, res) => {
    try {
        return res.status(200).json({
            message: "Bloom filter statistics",
            stats: {
                emailFilter: emailBloomFilter.getStats(),
                usernameFilter: usernameBloomFilter.getStats(),
                vendorEmailFilter: vendorEmailBloomFilter.getStats()
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching bloom filter stats",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

/**
 * POST /api/bloomfilter/rebuild
 * Rebuild bloom filters from database (useful after large data imports or resets)
 */
router.post("/rebuild", verifyAdmin, async (req, res) => {
    try {
        // Reset filters
        emailBloomFilter.reset();
        usernameBloomFilter.reset();
        vendorEmailBloomFilter.reset();

        // Rebuild from database
        const users = await authdatabase.find({ emailverified: true }).select("email username");
        const vendors = await vendormodel.find({}).select("Businessemail");

        let emailCount = 0;
        let usernameCount = 0;
        let vendorEmailCount = 0;

        // Add emails and usernames to bloom filters
        for (const user of users) {
            if (user.email) {
                emailBloomFilter.add(user.email);
                emailCount++;
            }
            if (user.username) {
                usernameBloomFilter.add(user.username);
                usernameCount++;
            }
        }

        // Add vendor emails to bloom filter
        for (const vendor of vendors) {
            if (vendor.Businessemail) {
                vendorEmailBloomFilter.add(vendor.Businessemail);
                vendorEmailCount++;
            }
        }

        return res.status(200).json({
            message: "Bloom filters rebuilt successfully",
            rebuilt: {
                emails: emailCount,
                usernames: usernameCount,
                vendorEmails: vendorEmailCount
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error rebuilding bloom filters",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

/**
 * POST /api/bloomfilter/add-email
 * Manually add email to bloom filter
 */
router.post("/add-email", verifyAdmin, (req, res) => {
    try {
        const { email, type = "user" } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Valid email string is required"
            });
        }

        const emailLower = email.toLowerCase();

        if (type === "vendor") {
            vendorEmailBloomFilter.add(emailLower);
        } else {
            emailBloomFilter.add(emailLower);
        }

        return res.status(200).json({
            message: `Email added to ${type} bloom filter`,
            email: emailLower
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error adding email to bloom filter",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

/**
 * POST /api/bloomfilter/add-username
 * Manually add username to bloom filter
 */
router.post("/add-username", verifyAdmin, (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== "string") {
            return res.status(400).json({
                message: "Valid username string is required"
            });
        }

        usernameBloomFilter.add(username.toLowerCase());

        return res.status(200).json({
            message: "Username added to bloom filter",
            username: username.toLowerCase()
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error adding username to bloom filter",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

/**
 * POST /api/bloomfilter/check
 * Check if email/username exists in bloom filter
 */
router.post("/check", verifyAdmin, (req, res) => {
    try {
        const { value, type = "email" } = req.body;

        if (!value || typeof value !== "string") {
            return res.status(400).json({
                message: "Valid value string is required"
            });
        }

        const valueLower = value.toLowerCase();
        let exists = false;

        if (type === "email") {
            exists = emailBloomFilter.has(valueLower);
        } else if (type === "username") {
            exists = usernameBloomFilter.has(valueLower);
        } else if (type === "vendor-email") {
            exists = vendorEmailBloomFilter.has(valueLower);
        }

        return res.status(200).json({
            message: `Check result for ${type}`,
            value: valueLower,
            type: type,
            possiblyExists: exists,
            note: "Bloom filters have false positives but no false negatives. Always verify with database."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error checking bloom filter",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

/**
 * POST /api/bloomfilter/reset
 * Reset all bloom filters (caution: this clears all data)
 */
router.post("/reset", verifyAdmin, (req, res) => {
    try {
        emailBloomFilter.reset();
        usernameBloomFilter.reset();
        vendorEmailBloomFilter.reset();

        return res.status(200).json({
            message: "All bloom filters have been reset"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error resetting bloom filters",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
});

module.exports = router;
