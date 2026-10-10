const jwt = require("jsonwebtoken");
const authdatabase = require("../models/auth.model");

require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const cookieSecurity = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
};

/**
 * Auto-refresh middleware
 * If access token is expired but refresh token is valid, automatically issue a new access token
 */
async function autoRefreshMiddleware(req, res, next) {
    try {
        const accesstoken = req.cookies.accesstoken;
        const refreshtoken = req.cookies.refreshtoken;

        // If access token exists and is valid, continue
        if (accesstoken) {
            try {
                jwt.verify(accesstoken, process.env.JWT_KEY);
                return next();
            } catch (error) {
                // Access token is expired or invalid
                if (error.name !== "TokenExpiredError") {
                    return next();
                }
            }
        }

        // Access token is expired, try to refresh using refresh token
        if (!refreshtoken) {
            return next(); // No refresh token, let the route handle it
        }

        // Decode expired access token to get user info
        let expiredTokenData;
        try {
            expiredTokenData = jwt.verify(accesstoken, process.env.JWT_KEY, { ignoreExpiration: true });
        } catch (error) {
            return next();
        }

        if (!expiredTokenData || !expiredTokenData.id) {
            return next();
        }

        // Verify user still exists
        const user = await authdatabase.findById(expiredTokenData.id);

        if (!user) {
            return next();
        }

        // Generate new access token
        const newAccesstoken = jwt.sign(
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

        // Set new access token cookie
        res.cookie(
            "accesstoken",
            newAccesstoken,
            {
                ...cookieSecurity,
                path: "/",
                maxAge: 15 * 60 * 1000
            }
        );

        // Continue to next middleware
        next();

    } catch (error) {
        console.error("Auto-refresh error:", error.message);
        next();
    }
}

module.exports = autoRefreshMiddleware;
