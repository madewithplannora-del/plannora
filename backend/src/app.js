
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const authroute = require("./routes/auth.route");
const vendorprofileroute = require("./routes/vendorprofile.route");
const bloomfilteradminroute = require("./routes/bloomfilter.admin.route");

const app = express();

// Trust proxy configuration
const trustProxy = process.env.TRUST_PROXY
    ? (
        /^\d+$/.test(process.env.TRUST_PROXY)
            ? Number(process.env.TRUST_PROXY)
            : process.env.TRUST_PROXY
                .split(",")
                .map((entry) => entry.trim())
    )
    : (process.env.NODE_ENV === "production" ? 1 : false);

app.set("trust proxy", trustProxy);

// CORS configuration: no frontend origins configured
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: [
        "Retry-After",
        "RateLimit-Limit",
        "RateLimit-Remaining",
        "RateLimit-Reset"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request logger
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.path}`
        );
    }

    next();
});

// Request body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));

app.use(cookieParser());

// Security headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                frameAncestors: ["'none'"]
            }
        },
        referrerPolicy: {
            policy: "strict-origin-when-cross-origin"
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true
        }
    })
);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

// Connectivity test
app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is working",
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use("/api/auth", authroute);
app.use("/api/vendorprofile", vendorprofileroute);
app.use("/api/bloomfilter", bloomfilteradminroute);

// Route not found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid request body"
        });
    }

    if (error.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed"
        });
    }

    console.error("UNHANDLED ERROR:", error.message);

    const status = error.status || 500;

    return res.status(status).json({
        success: false,
        message: status >= 500
            ? "Internal server error"
            : error.message
    });
});

module.exports = app;