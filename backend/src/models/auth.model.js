const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Invalid email"
        ]
    },

    password: {
        type: String,
        required: true,
        select:false
    },

    role: {
        type: String,
        enum: ["client", "vendor"],
        required: true
    },

    twoFactor:{
        type:Boolean,
        default:false
    },

    emailverified: {
        type: Boolean,
        default: false
    },

    vendorverified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const usermodel = mongoose.model("accounts", userSchema);

module.exports = usermodel;