const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    otp: {
        type: String,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const forgototp = mongoose.model("forgototp", otpSchema);

module.exports = forgototp;