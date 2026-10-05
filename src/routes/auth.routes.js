const express = require("express");
const {
    register,
    loginWithEmail,
    sendLoginOtp,
    verifyLoginOtp,
    verifyOtp,
    updateUser,
    deleteUser,
    getAllUsers,
    getProfile
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login-email", loginWithEmail);
router.post("/login-mobile/send-otp", sendLoginOtp);
router.post("/login-mobile/verify-otp", verifyLoginOtp);
router.post("/verify-otp", verifyOtp);
router.patch("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.get("/users", getAllUsers);
router.post("/login-token", authMiddleware, getProfile);
module.exports = router;