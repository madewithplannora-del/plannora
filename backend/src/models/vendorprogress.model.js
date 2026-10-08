const mongoose = require("mongoose");

const vendorProgressSchema = new mongoose.Schema(
    {
        vendorProfileID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "vendorprofiles",
            required: true,
            unique: true,
            index: true
        },

        // Profile activity/statistics
        visit_no: {
            type: Boolean,
            default: false
        },

        contact_clicks: {
            type: Boolean,
            default: false
        },

        people_visited: {
            type: Boolean,
            default: false
        },

        total_rating_on_all_post: {
            type: Boolean,
            default: false
        },

        total_no_of_people_rated: {
            type: Boolean,
            default: false
        },

        avg_rating_on_all_post: {
            type: Boolean,
            default: false
        },

        popularity_score: {
            type: Boolean,
            default: false
        },

        profileCompleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const vendorProgressModel = mongoose.model(
    "vendorprogress",
    vendorProgressSchema
);

module.exports = vendorProgressModel;