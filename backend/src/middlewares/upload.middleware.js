const multer = require("multer");

const storage = multer.memoryStorage();

// Magic bytes (file signatures) for allowed image formats
const IMAGE_SIGNATURES = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46],
};

// Validate file by magic bytes (prevents spoofed files)
const validateFileSignature = (buffer) => {
    if (!buffer || buffer.length < 4) {
        return false;
    }

    const bytes = buffer.slice(0, 4);

    // Check PNG
    if (bytes.length >= 4 && 
        bytes[0] === IMAGE_SIGNATURES.png[0] &&
        bytes[1] === IMAGE_SIGNATURES.png[1] &&
        bytes[2] === IMAGE_SIGNATURES.png[2] &&
        bytes[3] === IMAGE_SIGNATURES.png[3]) {
        return "png";
    }

    // Check JPEG
    if (bytes.length >= 3 &&
        bytes[0] === IMAGE_SIGNATURES.jpeg[0] &&
        bytes[1] === IMAGE_SIGNATURES.jpeg[1] &&
        bytes[2] === IMAGE_SIGNATURES.jpeg[2]) {
        return "jpeg";
    }

    // Check GIF
    if (bytes.length >= 3 &&
        bytes[0] === IMAGE_SIGNATURES.gif[0] &&
        bytes[1] === IMAGE_SIGNATURES.gif[1] &&
        bytes[2] === IMAGE_SIGNATURES.gif[2]) {
        return "gif";
    }

    // Check WebP (RIFF header)
    if (bytes.length >= 4 &&
        bytes[0] === IMAGE_SIGNATURES.webp[0] &&
        bytes[1] === IMAGE_SIGNATURES.webp[1] &&
        bytes[2] === IMAGE_SIGNATURES.webp[2] &&
        bytes[3] === IMAGE_SIGNATURES.webp[3]) {
        return "webp";
    }

    return false;
};

const fileFilter = (req, file, cb) => {

    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
    }

    // Additional validation will happen in the handler after buffer is available
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware to validate file signature after upload
const validateImageSignature = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const detectedFormat = validateFileSignature(req.file.buffer);

    if (!detectedFormat) {
        return res.status(400).json({
            message: "Invalid image file. File signature does not match a valid image format."
        });
    }

    // Store detected format for later use
    req.file.detectedFormat = detectedFormat;
    next();
};

module.exports = {
    upload,
    validateImageSignature
};