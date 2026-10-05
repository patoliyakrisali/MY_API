const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function sendOtp(mobile, otp) {

    const verification = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
            to: mobile,
            channel: "sms",
            customCode: otp
        });

    return verification;
}

module.exports = sendOtp;