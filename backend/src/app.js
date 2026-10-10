const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const authroute = require("./routes/auth.route");
const vendorprofileroute = require("./routes/vendorprofile.route");
const bloomfilteradminroute = require("./routes/bloomfilter.admin.route");

require("dotenv").config();

const app = express();

/*
    Trust proxy configuration.

    Locally there is no proxy, so trust nothing.
    In production, one proxy (Render, Nginx, etc.) normally sits
    in front of the backend, so trust exactly one hop.

    Override with TRUST_PROXY if your deployment topology requires it.
*/

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

// CORS configuration
const allowedOrigins = [
    // Localhost variants with different ports
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5501",
    "http://localhost:3000",
    // 127.0.0.1 variants
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5501",
    "http://127.0.0.1:3000",
    // Production
    "https://plannora-delta.vercel.app",
    "https://plannora-i3gu.onrender.com"
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log for debugging
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    exposedHeaders: [
        "Retry-After",
        "RateLimit-Limit",
        "RateLimit-Remaining",
        "RateLimit-Reset"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

app.use(express.json());

app.use(express.urlencoded({
    extended: true
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
app.get("/message", (req, res) => {
    res.status(200).json({
        status: "Server running"
    });
});

// Simple test endpoint to verify connectivity
app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is working",
        timestamp: new Date().toISOString()
    });
});


// Routes
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

    console.error("UNHANDLED ERROR:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    // Malformed JSON
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid request body"
        });
    }

    const status = error.status || 500;

    return res.status(status).json({
        success: false,
        message: status === 500
            ? "Internal server error"
            : error.message
    });
});


module.exports = app;