const mongoose = require("mongoose");

const twoFactorOtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true
    },

    otp: {
        type: String,
        required: true
    },

    attempts: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes
    }
});

const twoFactorOtpModel = mongoose.model("twofactorotps", twoFactorOtpSchema);

module.exports = twoFactorOtpModel;
