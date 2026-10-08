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

    /*
        Pending registration data.
        The permanent account is only
        created after the OTP is
        verified, so the registration
        details live here temporarily.
    */

    username: {
        type: String
    },

    password: {
        type: String
    },

    role: {
        type: String
    },

    attempts: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const otpmodel = mongoose.model("otp", otpSchema);

module.exports = otpmodel;