const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
async function sendEmail(to, subject, text) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        });
        console.log("Email sent:", info.messageId);
        return info;

    } catch (error) {
        console.log("Email Error:", error.message);
        throw error;
    }
}

module.exports = sendEmail;