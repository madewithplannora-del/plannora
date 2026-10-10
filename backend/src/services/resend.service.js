
require("dotenv").config();

const apiKey = process.env.RESEND_API_KEY;
const emailFrom =
    process.env.EMAIL_FROM || "Plannora <onboarding@resend.dev>";

if (!apiKey) {
    throw new Error(
        "RESEND_API_KEY is missing. Configure it in Render Environment."
    );
}

const { Resend } = require("resend");
const resend = new Resend(apiKey);

async function sendmail(to, subject, text, html) {
    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: [to],
            subject,
            text,
            html
        });

        if (error) {
            console.error("Resend email error:", error.message);
            throw new Error("Resend rejected the email request");
        }

        console.log("Resend accepted email:", data.id);
        return data;
    } catch (error) {
        console.error("Email service failed:", error.message);
        throw error;
    }
}

module.exports = sendmail;