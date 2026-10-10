const mongoose = require("mongoose");

//model imports
const authdatabase = require("../models/auth.model");
const otpmodel = require("../models/otp.model");
const forgototp = require("../models/forgototp.model");
const refreshTokenModel = require("../models/refreshToken.model");

//hashing and tokens
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const sendmail = require("../services/email.service");
const { generateOtp, getOtpMsg } = require("../utils/util");
const { emailBloomFilter, usernameBloomFilter } = require("../utils/bloomfilter");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

require("dotenv").config();

/*
    Shared auth cookie settings.

    `secure` is only switched on in production: a browser refuses to store a
    Secure cookie over plain http, so leaving it on during local development
    makes login look like it worked while the cookie is silently dropped.

    sameSite "none" is what allows the deployed frontend (a different origin)
    to send these cookies; "lax" is enough locally, and is the safer default.
*/
const isProduction = process.env.NODE_ENV === "production";

const cookieSecurity = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
};

// Register
async function registerUser(req, res) {
    try {
        const { username: rawUsername, email: rawEmail, password, role: rawRole = "client" } = req.body;

        const username = typeof rawUsername === "string" ? rawUsername.trim() : "";
        const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
        const role = rawRole === "vendor" ? "vendor" : "client";

        if (!username || !email || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Quick bloom filter check (eliminates most duplicates without DB query)
        const emailInFilter = emailBloomFilter.has(email);
        const usernameInFilter = usernameBloomFilter.has(username);

        if (emailInFilter || usernameInFilter) {
            // Bloom filter suggests duplicates exist - verify with DB to avoid false positives
            const userAlreadyExist = await authdatabase.findOne({
                $or: [
                    { email },
                    { username }
                ]
            });

            if (userAlreadyExist) {
                if (userAlreadyExist.email === email) {
                    if (userAlreadyExist.emailverified) {
                        return res.status(409).json({
                            message: "User already exist"
                        });
                    }
                } else {
                    return res.status(409).json({
                        message: "Username already taken"
                    });
                }
            }
        } else {
            // Bloom filter says it's new - still query once more to be safe
            const userAlreadyExist = await authdatabase.findOne({
                $or: [
                    { email },
                    { username }
                ]
            });

            if (userAlreadyExist) {
                if (userAlreadyExist.email === email) {
                    if (userAlreadyExist.emailverified) {
                        return res.status(409).json({
                            message: "User already exist"
                        });
                    }
                } else {
                    return res.status(409).json({
                        message: "Username already taken"
                    });
                }
            }
        }

        // Check if OTP already exists to prevent race conditions
        const existingOtp = await otpmodel.findOne({ email });
        if (existingOtp) {
            // Delete old OTP to prevent confusion (race condition protection)
            await otpmodel.deleteOne({ _id: existingOtp._id });
        }

        const hashedpassword = await bcrypt.hash(
            password,
            10
        );

        const otp = generateOtp();

        const hashedOtp = await bcrypt.hash(
            otp.toString(),
            10
        );

        await otpmodel.create({
            email,
            otp: hashedOtp,
            username,
            password: hashedpassword,
            role
        });

        const message = getOtpMsg(otp);

        await sendmail(
            email,
            "Email Verification OTP",
            message.text,
            message.html
        );

        return res.status(201).json({
            message: "OTP sent to email. Verify it to create your account."
        });

    } 
catch (error) {
    console.error("Error while registering user:", {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
    });

    return res.status(500).json({
        message: "Error while registering user",
        ...(process.env.NODE_ENV !== "production" && {
            error: error.message,
            code: error.code,
            command: error.command
        })
    });
}
}

// Verify otp
async function verifyOtp(req, res) {

    try {

        const email = req.body.email?.trim().toLowerCase();

        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpData = await otpmodel.findOne({
            email
        });

        if (!otpData) {
            return res.status(404).json({
                message: "OTP not found or expired"
            });
        }

        const createdAtMs = otpData.createdAt ? new Date(otpData.createdAt).getTime() : 0;
        const otpAge = Date.now() - createdAtMs;

        if (otpAge > 10 * 60 * 1000) {

            await otpmodel.deleteOne({
                _id: otpData._id
            });

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        // Check OTP attempt limit
        if (otpData.attempts >= 5) {

            await otpmodel.deleteOne({
                _id: otpData._id
            });

            return res.status(429).json({
                message: "Too many invalid attempts. Please register again."
            });
        }

        const otpMatch = await bcrypt.compare(
            String(otp),
            otpData.otp
        );

        if (!otpMatch) {

            otpData.attempts += 1;

            await otpData.save();

            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        let user = await authdatabase.findOne({
            email
        });

        if (user) {

            /*
                Legacy flow: account was
                created at registration
                time. Just verify it.
            */

            if (otpData.username) user.username = otpData.username;
            if (otpData.password) user.password = otpData.password;
            if (otpData.role) user.role = otpData.role;
            user.emailverified = true;

            await user.save();

        } else {

            /*
                New flow: the account is
                created only now, after
                successful OTP
                verification, using the
                pending registration data.
            */

            if (
                !otpData.username ||
                !otpData.password
            ) {
                return res.status(400).json({
                    message: "Registration data missing. Please register again."
                });
            }

            try {
                user = await authdatabase.create({
                    username: otpData.username,
                    email,
                    password: otpData.password,
                    role: otpData.role || "client",
                    emailverified: true
                });
            } catch (createError) {
                if (createError.code === 11000) {
                    return res.status(409).json({
                        message: "Username or email already in use. Please register again."
                    });
                }
                throw createError;
            }

        }

        await otpmodel.deleteOne({
            _id: otpData._id
        });

        // Add to bloom filter after successful creation
        emailBloomFilter.add(email);
        if (user.username) usernameBloomFilter.add(user.username);

        const accesstoken = jwt.sign(
    {
        username: user.username,
        id: user._id,
        role: user.role
    },
    process.env.JWT_KEY,
    {
        expiresIn: "15m"
    }
);

    const refreshtoken = crypto.randomBytes(64).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(refreshtoken)
        .digest("hex");

    await refreshTokenModel.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        )
    });

    res.cookie(
        "accesstoken",
        accesstoken,
        {
            ...cookieSecurity,
            path: "/",
            maxAge: 15 * 60 * 1000
        }
    );

    res.cookie(
        "refreshtoken",
        refreshtoken,
        {
            ...cookieSecurity,
            path: "/api/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );

        return res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while verifying OTP",
            ...(process.env.NODE_ENV !== "production" && {
                error: error.message
            })
        });

    }
}

// Login
async function loginUser(req, res) {

    try {

        const rawUsername = req.body.username;
        const rawEmail = req.body.email;
        const password = req.body.password;

        const username = typeof rawUsername === "string" && rawUsername.trim() ? rawUsername.trim() : undefined;
        const email = typeof rawEmail === "string" && rawEmail.trim() ? rawEmail.trim().toLowerCase() : undefined;

        if ((!username && !email) || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Username or email and password are required"
            });
        }

        const userExist = await authdatabase.findOne({
            $or: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
            ]
        }).select("+password");

        if (!userExist) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!userExist.emailverified) {
            return res.status(403).json({
                message: "Please verify your email first"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                userExist.password
            );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const accesstoken = jwt.sign(
    {
        username: userExist.username,
        id: userExist._id,
        role: userExist.role
    },
    process.env.JWT_KEY,
    {
        expiresIn: "15m"
    }
);

const refreshtoken = crypto.randomBytes(64).toString("hex");

const tokenHash = crypto
    .createHash("sha256")
    .update(refreshtoken)
    .digest("hex");

await refreshTokenModel.create({
    userId: userExist._id,
    tokenHash,
    expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    )
});

res.cookie(
    "accesstoken",
    accesstoken,
    {
        ...cookieSecurity,
        path: "/",
        maxAge: 15 * 60 * 1000
    }
);

res.cookie(
    "refreshtoken",
    refreshtoken,
    {
        ...cookieSecurity,
        path: "/api/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
);
        return res.status(200).json({
            message: "Logged in"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while logging in",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }
}

// Forgot password
async function forgotPassword(req, res) {

    try {

        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await authdatabase.findOne({
            email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const otp = generateOtp();

        const hashedOtp = await bcrypt.hash(
            otp.toString(),
            10
        );

        await forgototp.deleteMany({
            email
        });

        await forgototp.create({
            email,
            otp: hashedOtp,
            attempts: 0
        });

        const message = getOtpMsg(otp);

        await sendmail(
            email,
            "Password Reset OTP",
            message.text,
            message.html
        );

        return res.status(200).json({
            message: "Password reset OTP sent to email"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while sending password reset OTP",
            ...(process.env.NODE_ENV !== "production" && {
                error: error.message
            })
        });

    }
}

// Verify forgot password OTP
async function verifyForgotOtp(req, res) {

    try {

        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpData = await forgototp.findOne({
            email
        });

        if (!otpData) {
            return res.status(404).json({
                message: "OTP not found or expired"
            });
        }

        const createdAtMs = otpData.createdAt ? new Date(otpData.createdAt).getTime() : 0;
        const otpAge = Date.now() - createdAtMs;

        if (otpAge > 10 * 60 * 1000) {

            await forgototp.deleteOne({
                _id: otpData._id
            });

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        if (otpData.attempts >= 5) {

            await forgototp.deleteOne({
                _id: otpData._id
            });

            return res.status(400).json({
                message: "Too many OTP attempts"
            });
        }

        const otpMatch = await bcrypt.compare(
            otp.toString(),
            otpData.otp
        );

        if (!otpMatch) {

            otpData.attempts += 1;

            await otpData.save();

            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const user = await authdatabase.findOne({
            email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await forgototp.deleteOne({
            _id: otpData._id
        });

        const resetToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                purpose: "password-reset"
            },
            process.env.JWT_KEY,
            {
                expiresIn: "2m"
            }
        );

        res.cookie(
            "resettoken",
            resetToken,
            {
                ...cookieSecurity,
                path: "/",
                maxAge: 2 * 60 * 1000
            }
        );

        return res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while verifying forgot password OTP",
            ...(process.env.NODE_ENV !== "production" && {
                error: error.message
            })
        });

    }
}

// Reset password
async function resetPassword(req, res) {

    try {

        const {
            resetpassword
        } = req.body;

        if (!resetpassword) {
            return res.status(400).json({
                message: "New password is required"
            });
        }

        const resetToken = req.cookies.resettoken;

        if (!resetToken) {
            return res.status(401).json({
                message: "Reset token not found or expired"
            });
        }

        let decoded;

        try {

            decoded = jwt.verify(
                resetToken,
                process.env.JWT_KEY
            );

        } catch (error) {

            return res.status(401).json({
                message: "Reset token is invalid or expired"
            });

        }

        if (decoded.purpose !== "password-reset") {
            return res.status(401).json({
                message: "Invalid reset token"
            });
        }

        const user = await authdatabase.findById(
            decoded.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(
            resetpassword,
            10
        );

        user.password = hashedPassword;

        await user.save();

        // Revoke all existing sessions for this user upon password reset
        await refreshTokenModel.deleteMany({
            userId: user._id
        });

        res.clearCookie(
            "resettoken",
            {
                ...cookieSecurity,
                path: "/"
            }
        );

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while resetting password",
            ...(process.env.NODE_ENV !== "production" && {
                error: error.message
            })
        });

    }
}

// Logout
async function logoutUser(req, res) {

    /*
        Revoke the stored refresh token. Without this it stays usable for its
        full 7 day lifetime even though the user has logged out.
    */
    try {

        const refreshtoken = req.cookies.refreshtoken;

        if (refreshtoken) {

            const tokenHash = crypto
                .createHash("sha256")
                .update(refreshtoken)
                .digest("hex");

            await refreshTokenModel.deleteOne({
                tokenHash
            });

        }

    } catch (error) {

        console.error("Failed to revoke refresh token:", error.message);

    }

    // Clear access token
    res.clearCookie("accesstoken", {
        ...cookieSecurity,
        path: "/"
    });

    // Clear refresh token
    res.clearCookie("refreshtoken", {
        ...cookieSecurity,
        path: "/api/auth"
    });

    // Clear password reset token
    res.clearCookie("resettoken", {
        ...cookieSecurity,
        path: "/"
    });

    return res.status(200).json({
        message: "Logged out successfully"
    });

}

async function getMe(req, res) {

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

        const user = await authdatabase.findById(
            decoded.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                emailverified: user.emailverified,
                vendorverified: user.vendorverified
            }
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while fetching user",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }

}

/*
    Exchanges a valid refresh cookie for a new access token. The cookie is
    scoped to this exact path, so it only ever reaches this handler.
*/
async function refreshAccessToken(req, res) {

    try {

        const refreshtoken = req.cookies.refreshtoken;

        if (!refreshtoken) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshtoken)
            .digest("hex");

        const storedToken = await refreshTokenModel.findOne({
            tokenHash
        });

        if (
            !storedToken ||
            storedToken.revokedAt ||
            storedToken.expiresAt.getTime() < Date.now()
        ) {
            return res.status(401).json({
                message: "Refresh token is invalid or expired"
            });
        }

        const user = await authdatabase.findById(
            storedToken.userId
        );

        if (!user) {
            return res.status(401).json({
                message: "Refresh token is invalid or expired"
            });
        }

        const accesstoken = jwt.sign(
            {
                username: user.username,
                id: user._id,
                role: user.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: "15m"
            }
        );

        res.cookie(
            "accesstoken",
            accesstoken,
            {
                ...cookieSecurity,
                path: "/",
                maxAge: 15 * 60 * 1000
            }
        );

        return res.status(200).json({
            message: "Access token refreshed"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error while refreshing access token",
            ...(process.env.NODE_ENV !== "production" && { error: error.message })
        });

    }

}

async function googleauth(req, res) {

    // Diagnostic endpoint to help identify missing configuration
    const diagnostics = {
        configured: {
            EMAIL: !!process.env.EMAIL,
            CLIENT_ID: !!process.env.CLIENT_ID,
            CLIENT_SECRET: !!process.env.CLIENT_SECRET,
            REFRESH_TOKEN: !!process.env.REFRESH_TOKEN
        },
        missingConfig: [],
        requirements: {
            EMAIL: "Gmail address (e.g., yourapp@gmail.com)",
            CLIENT_ID: "OAuth2 Client ID from Google Console",
            CLIENT_SECRET: "OAuth2 Client Secret from Google Console",
            REFRESH_TOKEN: "Long-lived refresh token (generated via OAuth2 flow)"
        }
    };

    // Check what's missing
    if (!process.env.EMAIL) diagnostics.missingConfig.push("EMAIL");
    if (!process.env.CLIENT_ID) diagnostics.missingConfig.push("CLIENT_ID");
    if (!process.env.CLIENT_SECRET) diagnostics.missingConfig.push("CLIENT_SECRET");
    if (!process.env.REFRESH_TOKEN) diagnostics.missingConfig.push("REFRESH_TOKEN");

    // If all configured, endpoint is not yet implemented
    if (diagnostics.missingConfig.length === 0) {
        return res.status(501).json({ 
            message: "Google Auth endpoint not yet implemented. All configuration is present.",
            diagnostics
        });
    }

    // Return diagnostic info about what's missing
    return res.status(400).json({
        message: "Google Auth configuration incomplete",
        diagnostics,
        setupInstructions: {
            step1: "Create OAuth2 credentials in Google Console (https://console.cloud.google.com)",
            step2: "Set APPLICATION TYPE to 'Web application'",
            step3: "Add authorized redirect URI: YOUR_BACKEND_URL/api/auth/google/callback",
            step4: "Copy CLIENT_ID and CLIENT_SECRET to .env",
            step5: "Generate REFRESH_TOKEN using Google OAuth2 Playground or your app's OAuth flow",
            step6: "Gmail account must have 2FA enabled and App Passwords generated"
        }
    });

}

module.exports = {
    registerUser,
    verifyOtp,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyForgotOtp,
    resetPassword,
    getMe,
    refreshAccessToken,
    googleauth
};


