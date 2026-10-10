const vendormodel = require("../models/vendorprofile.model");
const authdatabase = require("../models/auth.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// Create vendor profile
async function createVendorProfile(req, res) {
    try {
        const token = req.cookies.accesstoken;

        if (!token) {
            return res.status(401).json({
                message: "Access token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        const vendorID = decoded.id;

        // Check if user is vendor
        const user = await authdatabase.findById(vendorID);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role.toLowerCase() !== "vendor") {
            return res.status(403).json({
                message: "Only vendors can create a vendor profile"
            });
        }

        // Check if profile already exists
        const existingProfile = await vendormodel.findOne({ vendorID });

        if (existingProfile) {
            return res.status(409).json({
                message: "Vendor profile already exists"
            });
        }

        const { number: rawNumber, BusinessName: rawBusinessName, bio: rawBio } = req.body;

        const number = typeof rawNumber === "string" ? rawNumber.trim() : "";
        const BusinessName = typeof rawBusinessName === "string" ? rawBusinessName.trim() : "";
        const bio = typeof rawBio === "string" ? rawBio.trim() : "";

        if (!number || !BusinessName) {
            return res.status(400).json({
                message: "Number and business name are required"
            });
        }

        // Create vendor profile
        const vendorProfile = await vendormodel.create({
            vendorID: user._id,
            username: user.username,
            Businessemail: user.email,
            number,
            BusinessName,
            bio
        });

        user.vendorverified = true;
        await user.save();

        return res.status(201).json({
            message: "Vendor profile created successfully",
            vendorProfile: {
                _id: vendorProfile._id,
                username: vendorProfile.username,
                Businessemail: vendorProfile.Businessemail,
                number: vendorProfile.number,
                BusinessName: vendorProfile.BusinessName,
                bio: vendorProfile.bio
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error while creating vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
}

// Get vendor profile (current logged-in vendor only)
async function getVendorProfile(req, res) {
    try {
        const token = req.cookies.accesstoken;

        if (!token) {
            return res.status(401).json({
                message: "Access token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        const vendorID = decoded.id;

        // Check if user is vendor
        const user = await authdatabase.findById(vendorID);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role.toLowerCase() !== "vendor") {
            return res.status(403).json({
                message: "Only vendors can access vendor profile"
            });
        }

        // Get vendor profile
        const vendorProfile = await vendormodel.findOne({ vendorID });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        return res.status(200).json({
            message: "Vendor profile fetched successfully",
            vendorProfile: {
                _id: vendorProfile._id,
                username: vendorProfile.username,
                Businessemail: vendorProfile.Businessemail,
                number: vendorProfile.number,
                BusinessName: vendorProfile.BusinessName,
                bio: vendorProfile.bio
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error while fetching vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
}

// Update vendor profile (only own profile)
async function updateVendorProfile(req, res) {
    try {
        const token = req.cookies.accesstoken;

        if (!token) {
            return res.status(401).json({
                message: "Access token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        const vendorID = decoded.id;

        // Check if user is vendor
        const user = await authdatabase.findById(vendorID);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role.toLowerCase() !== "vendor") {
            return res.status(403).json({
                message: "Only vendors can update vendor profile"
            });
        }

        const vendorProfile = await vendormodel.findOne({ vendorID });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        const { number, BusinessName, bio } = req.body;

        if (number !== undefined) {
            if (typeof number !== "string" || !number.trim()) {
                return res.status(400).json({
                    message: "Contact number cannot be empty"
                });
            }
            vendorProfile.number = number.trim();
        }

        if (BusinessName !== undefined) {
            if (typeof BusinessName !== "string" || !BusinessName.trim()) {
                return res.status(400).json({
                    message: "Business name cannot be empty"
                });
            }
            vendorProfile.BusinessName = BusinessName.trim();
        }

        if (bio !== undefined) {
            vendorProfile.bio = typeof bio === "string" ? bio.trim() : "";
        }

        await vendorProfile.save();

        return res.status(200).json({
            message: "Vendor profile updated successfully",
            vendorProfile: {
                _id: vendorProfile._id,
                username: vendorProfile.username,
                Businessemail: vendorProfile.Businessemail,
                number: vendorProfile.number,
                BusinessName: vendorProfile.BusinessName,
                bio: vendorProfile.bio
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error while updating vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
}

// Delete vendor profile (only own profile)
async function deleteVendorProfile(req, res) {
    try {
        const token = req.cookies.accesstoken;

        if (!token) {
            return res.status(401).json({
                message: "Access token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            return res.status(401).json({
                message: "Invalid or expired access token"
            });
        }

        const vendorID = decoded.id;

        // Check if user is vendor
        const user = await authdatabase.findById(vendorID);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role.toLowerCase() !== "vendor") {
            return res.status(403).json({
                message: "Only vendors can delete vendor profile"
            });
        }

        const vendorProfile = await vendormodel.findOne({ vendorID });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        await vendormodel.deleteOne({ _id: vendorProfile._id });

        user.vendorverified = false;
        await user.save();

        return res.status(200).json({
            message: "Vendor profile deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error while deleting vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });
    }
}

module.exports = {
    createVendorProfile,
    getVendorProfile,
    updateVendorProfile,
    deleteVendorProfile
};
