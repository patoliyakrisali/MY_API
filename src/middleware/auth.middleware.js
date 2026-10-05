const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token required"
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("Token received:", token);
        console.log(
            "JWT SECRET exists:",
            !!process.env.JWT_SECRET
        );

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded token:", decoded);

        const user = await User.findById(decoded.userId)
            .select("-password -otp");

        if (!user) {
            return res.status(401).json({
                message: "Invalid token user"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("TOKEN ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
}

module.exports = authMiddleware;