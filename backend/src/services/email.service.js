const nodemailer = require("nodemailer");
require("dotenv").config();

// Brevo SMTP transporter
// Free tier: 300 emails/day, no credit card needed
// Works on Render free tier - SMTP port 587 is accessible
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // Use TLS, not SSL
    auth: {
        user: process.env.BREVO_EMAIL || "noreply@plannora.com",
        pass: process.env.BREVO_API_KEY
    }
});

async function sendmail(to, subject, text, html) {
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is not configured in environment variables");
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || "noreply@plannora.com",
            to,
            subject,
            text,
            html
        });

        console.log("Email sent via Brevo:", info.messageId);
        return info;

    } catch (error) {
        console.error("Email sending error:", error.message);
        throw error;
    }
}

module.exports = sendmail;
