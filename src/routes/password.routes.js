const express = require("express");

const {
    changePassword,
    forgotPasswordSendOtp,
    verifyForgotPasswordOtp,
    resetPassword
} = require("../controllers/password.controller");
const router = express.Router();


router.post("/forgot-password/send-otp",forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp",verifyForgotPasswordOtp);
router.patch("/forgot-password/reset",resetPassword);
router.patch("/change-password",changePassword);
module.exports = router;