const { Resend } = require("resend");
require("dotenv").config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendmail(to, subject, text, html) {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured in environment variables");
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Plannora <onboarding@resend.dev>",
            to: [to],
            subject,
            text,
            html
        });

        if (error) {
            console.error("Resend email error:", error.message);
            throw new Error("Failed to send email: " + error.message);
        }

        console.log("Email sent via Resend:", data.id);
        return data;
    } catch (error) {
        console.error("Email service error:", error.message);
        throw error;
    }
}

module.exports = sendmail;