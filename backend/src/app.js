const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

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

/*
    CORS

    Frontend origin will be added later once the frontend port/domain
    is finalized.

    credentials: true is required because the authentication system
    uses cookies.
*/

app.use(cors({
    credentials: true,

    exposedHeaders: [
        "Retry-After",
        "RateLimit-Limit",
        "RateLimit-Remaining",
        "RateLimit-Reset"
    ]
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());


// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok"
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