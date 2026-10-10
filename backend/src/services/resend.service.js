
const { Resend } = require("resend");
require("dotenv").config();

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
}

if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendmail(to, subject, text, html) {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        text,
        html
    });

    if (error) {
        console.error("Resend email error:", error.message);
        throw new Error("Failed to send email");
    }

    console.log("Email accepted by Resend:", data.id);
    return data;
}

module.exports = sendmail;