const vendormodel = require("../models/vendorprofile.model");
const authdatabase = require("../models/auth.model");
const vendorprogressmodel = require("../models/vendorprogress.model")

const imagekitService = require("../storage/imagekit.service");
const { vendorEmailBloomFilter } = require("../utils/bloomfilter");

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

            decoded = jwt.verify(
                token,
                process.env.JWT_KEY
            );

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

        const {
            number: rawNumber,
            BusinessName: rawBusinessName,
            bio: rawBio
        } = req.body;

        const number = typeof rawNumber === "string" ? rawNumber.trim() : "";
        const BusinessName = typeof rawBusinessName === "string" ? rawBusinessName.trim() : "";
        const bio = typeof rawBio === "string" ? rawBio.trim() : "";

        if (!number || !BusinessName) {
            return res.status(400).json({
                message: "Number and business name are required"
            });
        }

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

        const existingProfile = await vendormodel.findOne({
            vendorID
        });

        if (existingProfile) {
            return res.status(409).json({
                message: "Vendor profile already exists"
            });
        }

        // Check bloom filter for quick duplicate detection
        const businessEmailInFilter = vendorEmailBloomFilter.has(rawBusinessEmail || Businessemail);
        
        let logoUrl = "";

        // Handle profile picture upload if provided
        if (req.file) {
            try {
                
                const fileName = `vendor-${vendorID}-profile-${Date.now()}.${req.file.mimetype.split('/')[1]}`;

                const uploadResult = await imagekitService.uploadVendorProfilePicture(
                    req.file.buffer,
                    vendorID.toString(),
                    fileName
                );

                logoUrl = uploadResult.url;

            } catch (uploadError) {
                return res.status(500).json({
                    message: "Error uploading profile picture",
                    ...(process.env.NODE_ENV !== "production" && { error: uploadError.message })
                });
            }
        }

        const vendorProfile = await vendormodel.create({
            vendorID: user._id,
            username: user.username,
            Businessemail: user.email,
            number,
            BusinessName,
            bio,
            logo: logoUrl
        });

        // Add vendor email to bloom filter for future quick lookups
        vendorEmailBloomFilter.add(user.email); 

        /*

        await vendorprogressmodel.create({
            vendorProfileID: vendorProfile._id,
            profileCompleted: Boolean(
                vendorProfile.username &&
                vendorProfile.Businessemail &&
                vendorProfile.number &&
                vendorProfile.BusinessName &&
                vendorProfile.bio &&
                vendorProfile.logo
            )
        })

        */

        user.vendorverified = true;

        await user.save();

        return res.status(201).json({
            message: "Vendor profile created successfully",
            vendorProfile
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while creating vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}


// Update vendor details
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

            decoded = jwt.verify(
                token,
                process.env.JWT_KEY
            );

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

        const {
            number,
            BusinessName,
            bio
        } = req.body;

        const vendorProfile = await vendormodel.findOne({
            vendorID
        });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

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

        // Handle profile picture upload if provided
        if (req.file) {
            try {
                const fileName = `vendor-${vendorID}-profile-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
                const uploadResult = await imagekitService.uploadVendorProfilePicture(
                    req.file.buffer,
                    vendorID.toString(),
                    fileName
                );
                vendorProfile.logo = uploadResult.url;
            } catch (uploadError) {
                return res.status(500).json({
                    message: "Error uploading profile picture",
                    ...(process.env.NODE_ENV !== "production" && { error: uploadError.message })
                });
            }
        }

        await vendorProfile.save();

        /*

        await vendorprogressmodel.findOneAndUpdate(
            { vendorProfileID: vendorProfile._id },
            {
                profileCompleted: Boolean(
                    vendorProfile.username &&
                    vendorProfile.Businessemail &&
                    vendorProfile.number &&
                    vendorProfile.BusinessName &&
                    vendorProfile.bio &&
                    vendorProfile.logo
                )
            }   
        );

        */

        return res.status(200).json({
            message: "Vendor profile updated successfully",
            vendorProfile
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while updating vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}


// Delete the vendor profile
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

            decoded = jwt.verify(
                token,
                process.env.JWT_KEY
            );

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

        const vendorProfile = await vendormodel.findOne({
            vendorID
        });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        /*

        await vendorprogressmodel.deleteOne({
            vendorProfileID: vendorProfile._id
        });
        
        */

        await vendormodel.deleteOne({
            _id: vendorProfile._id
        });

        const user = await authdatabase.findById(vendorID);

        if (user) {
            user.vendorverified = false;
            await user.save();
        }

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


// Vendor analytics
async function vendorAnalytics(req, res) {

    try {

        const token = req.cookies.accesstoken;

        if (!token) {
            return res.status(401).json({
                message: "Access token not found"
            });
        }

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_KEY
            );

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

        const vendorProfile = await vendormodel.findOne({
            vendorID
        });

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        const visits = vendorProfile.visit_no || 0;
        const contactClicks = vendorProfile.contact_clicks || 0;
        const peopleVisited = vendorProfile.people_visited || 0;
        const totalRatings = vendorProfile.total_no_of_people_rated || 0;
        const totalRatingStars = vendorProfile.total_rating_on_all_post || 0;
        const averageRating = vendorProfile.avg_rating_on_all_post || 0;

        const popularityScore =
            (visits * 0.30) +
            (contactClicks * 0.30) +
            (peopleVisited * 0.20) +
            (averageRating * 20 * 0.20);

        return res.status(200).json({

            message: "Vendor analytics fetched successfully",

            analytics: {

                visits: visits,

                contactClicks: contactClicks,

                peopleVisited: peopleVisited,

                totalRatings: totalRatings,

                totalRatingStars: totalRatingStars,

                averageRating: averageRating,

                popularityScore: Number(
                    popularityScore.toFixed(2)
                )

            }

        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while fetching vendor analytics",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}

/* 
    Below operations are client + vendor 
*/

/*
    Recomputes the stored popularity score from the profile counters, using the
    same weighting as vendorAnalytics().
*/
async function recalculatePopularity(vendorID) {

    const vendorProfile = await vendormodel.findOne({
        vendorID
    });

    if (!vendorProfile) {
        return;
    }

    const popularityScore =
        ((vendorProfile.visit_no || 0) * 0.30) +
        ((vendorProfile.contact_clicks || 0) * 0.30) +
        ((vendorProfile.people_visited || 0) * 0.20) +
        ((vendorProfile.avg_rating_on_all_post || 0) * 20 * 0.20);

    vendorProfile.popularity_score = Number(
        popularityScore.toFixed(2)
    );

    await vendorProfile.save();

}

//get vendor profile
async function getVendorProfile(req, res) {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid vendor profile ID"
            });
        }

        const vendorProfile = await vendormodel.findByIdAndUpdate(
            id,
            { $inc: { visit_no: 1 } },
            { new: true }
        );

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        // Recalculate popularity after visit increment
        try {
            await recalculatePopularity(vendorProfile.vendorID);
        } catch (popError) {
            console.error("Popularity recalculation error:", popError.message);
        }

        return res.status(200).json({
            message: "Vendor profile fetched successfully",
            vendorProfile: {
                _id: vendorProfile._id,
                username: vendorProfile.username,
                Businessemail: vendorProfile.Businessemail,
                BusinessName: vendorProfile.BusinessName,
                bio: vendorProfile.bio,
                logo: vendorProfile.logo,
                visit_no: vendorProfile.visit_no,
                contact_clicks: vendorProfile.contact_clicks,
                avg_rating_on_all_post: vendorProfile.avg_rating_on_all_post,
                popularity_score: vendorProfile.popularity_score
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while fetching vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}


// Contact details
async function contactClick(req, res) {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid vendor profile ID"
            });
        }

        const vendorProfile = await vendormodel.findByIdAndUpdate(
            id,
            { $inc: { contact_clicks: 1, people_visited: 1 } },
            { new: true }
        );

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        // Recalculate popularity after contact click
        try {
            await recalculatePopularity(vendorProfile.vendorID);
        } catch (popError) {
            console.error("Popularity recalculation error:", popError.message);
        }

        return res.status(200).json({
            message: "Contact click recorded",
            contact_clicks: vendorProfile.contact_clicks
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while recording contact click",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}


//get vendor by vendorID
async function getVendorProfileByVendorID(req, res) {

    try {

        const { vendorID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(vendorID)) {
            return res.status(400).json({
                message: "Invalid vendor ID"
            });
        }

        const vendorProfile = await vendormodel.findOneAndUpdate(
            { vendorID: vendorID },
            { $inc: { visit_no: 1 } },
            { new: true }
        );

        if (!vendorProfile) {
            return res.status(404).json({
                message: "Vendor profile not found"
            });
        }

        // Recalculate popularity after visit increment
        try {
            await recalculatePopularity(vendorProfile.vendorID);
        } catch (popError) {
            console.error("Popularity recalculation error:", popError.message);
        }

        return res.status(200).json({
            message: "Vendor profile fetched successfully",
            vendorProfile: {
                _id: vendorProfile._id,
                vendorID: vendorProfile.vendorID,
                username: vendorProfile.username,
                Businessemail: vendorProfile.Businessemail,
                number: vendorProfile.number,
                BusinessName: vendorProfile.BusinessName,
                bio: vendorProfile.bio,
                logo: vendorProfile.logo,
                visit_no: vendorProfile.visit_no,
                contact_clicks: vendorProfile.contact_clicks,
                avg_rating_on_all_post: vendorProfile.avg_rating_on_all_post,
                popularity_score: vendorProfile.popularity_score
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while fetching vendor profile",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}

module.exports = {

    /* Only Vendor Operations */
    createVendorProfile,
    updateVendorProfile,
    deleteVendorProfile,
    //vendorAnalytics,

    /* Vendor + Client Operations */
    getVendorProfile,
    getVendorProfileByVendorID,
    contactClick

};
