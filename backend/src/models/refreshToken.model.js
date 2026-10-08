const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts",
        required: true
    },

    tokenHash: {
        type: String,
        required: true,
        unique: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    revokedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const refreshTokenModel = mongoose.model(
    "refreshTokens",
    refreshTokenSchema
);

module.exports = refreshTokenModel;