const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema({

        vendorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true,
        unique: true
    },
    
    username: {
        type: String,
        required: true,
        trim: true
    },

    Businessemail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    number: {
        type: String,
        required: true,
        trim: true
    },

    BusinessName: {
        type: String,
        required: true,
        trim: true
    },

    bio: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500
    },

    // ImageKit URL will be stored here
    logo: {
        type: String,
        default: "",
        trim: true
    },
}, {
    timestamps: true
});

const vendormodel = mongoose.model(
    "vendorprofiles",
    vendorProfileSchema
);

module.exports = vendormodel;