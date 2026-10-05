const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const generateOtp = require("../commonFunction/otp_send");
const sendEmail = require("../services/email.service");

//  ======================Change Password====================

async function changePassword(req, res) {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                message: "userId, oldPassword and newPassword are required"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );
        if (!isMatch) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }
        if (newPassword.length < 3) {
            return res.status(400).json({
                message: "New password must be at least 3 characters"
            });
        }
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to change password",
            error: error.message
        });
    }
}

// ============Forgot Password → Send OTP===========

async function forgotPasswordSendOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found Please register first"
            });
        }

        const otp = generateOtp();

        user.otp = otp;

        await user.save();

        // await sendEmail(
        //     user.email,
        //     "Forgot Password OTP",
        //     `Your password reset OTP is ${otp}`
        // );

        return res.status(200).json({
            message: "OTP sent successfully",
            otp
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
}

// =============Verify Forgot Password OTP===================

async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found please register first"
            });
        }

        console.log("Saved OTP:", user.resetOtp);
        console.log("Entered OTP:", otp);

        

        user.resetOtpVerified = true;
        user.resetOtp = undefined;

        await user.save();

        return res.status(200).json({
            message: "OTP verified. You can reset password now"
        });

    } catch (error) {
        console.log("VERIFY OTP ERROR:", error);

        return res.status(500).json({
            message: "OTP verification failed",
            error: error.message
        });
    }
}
// ===========resetPassword==============
async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // if (!user.resetOtpVerified) {
        //     return res.status(403).json({
        //         message: "Please verify OTP first"
        //     });
        // }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;
        user.resetOtpVerified = false;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Password reset failed",
            error: error.message
        });
    }
}


module.exports = {
    changePassword,
    forgotPasswordSendOtp,
    verifyForgotPasswordOtp,
    resetPassword
}