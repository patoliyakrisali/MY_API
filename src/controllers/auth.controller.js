const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const generateOtp = require("../commonFunction/otp_send");
const sendOtpService = require("../services/sms.service");
// ====================== Register + Send OTP =====================

async function register(req, res) {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name ||!email || !password || !mobile) {
            return res.status(400).json({
                message: "Name, email, passwrd and mobile  are required"
            });
        }
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({
                message: "Mobile number already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("==hashedPassword==",hashedPassword)
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();
        console.log("==otp==",otp)

        const user = await User.create({
            name,
            mobile,
            email,
            password: hashedPassword,
            otp,
        });
       
      
        console.log("==user==",user)
        // await client.messages.create({
        //     body: `Your registration OTP is ${otp}. It is valid for 5 minutes.`,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: mobile
        // });
        return res.status(201).json({
            message: `OTP sent successfully ${otp}`,
            userId: user,
            
        });
    } catch (error) {
        console.log("=====",error.message)
        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
}

// ====================== Verify OTP =====================

async function verifyOtp(req, res) {
    try {
        const { mobile, otp } = req.body;
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }
        await user.save();
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
          );
      
        user.isVerified = true;
        user.otp = undefined;
        await user.save();
        return res.status(200).json({
            message: "Mobile number verified successfully",
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "OTP verification failed",
            error: error.message
        });
    }
}

// ================= EMAIL LOGIN =================

async function loginWithEmail(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        return res.status(200).json({
            message: "Login successful",
            userId: user._id
        });

    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}

// ================= SEND MOBILE LOGIN OTP =================

async function sendLoginOtp(req, res) {
    try {

        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                message: "Mobile number is required"
            });
        }

        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(404).json({
                message: "User not found Please First register"
            });
        }

        // Generate OTP
        const otp = generateOtp();
        user.otp = otp;
        await user.save();

        // await sendOtpService(mobile, otp);

        return res.status(200).json({
            message: "Login OTP sent successfully",
            otp:otp
        });

    } catch (error) {

        console.log("SEND LOGIN OTP ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to send login OTP",
            error: error.message
        });
    }
}
// ================= VERIFY MOBILE LOGIN OTP =================

async function verifyLoginOtp(req, res) {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                message: "Mobile and OTP are required"
            });
        }

        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        user.otp = undefined;
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        return res.status(200).json({
            message: "Login successful",
            userId: user._id,
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: "OTP verification failed",
            error: error.message
        });
    }
}
// ======================User Update====================

async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const allowedFields = [
            "name",
            "email",
            "mobile",
            "dateofbirth",
            "gender",
            "address",
            "city",
            "state",
            "country",
            "profileImage",
            "bio"
        ];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select("-password -otp");
        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
}

// ======================Delete User====================
 
async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
}

// =====================Get All Users====================

async function getAllUsers(req, res) {
    try {
        const users = await User.find()
            .select("-password -otp");

        return res.status(200).json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
}
// =========== get profile===================
async function getProfile(req, res) {
    try {
        return res.status(200).json({
            message: "Profile fetched successfully",
            user: req.user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
}


module.exports = {
    register,
    verifyOtp,
    loginWithEmail,
    sendLoginOtp,
    verifyLoginOtp,
    updateUser,
    deleteUser,
    getAllUsers,
    getProfile
};