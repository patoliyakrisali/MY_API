const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required for creating user"],
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:[3,"Password must be at least 3 characters"]
    },
    otp:{
        type:String
    },
    mobile:{
        type:String
    },
    dateofbirth:{
        type:String
    },
    gender:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    country:{
        type:String
    },
    profileImage: {
        type: String
    },
    bio: {
        type: String
    },
    // resetOtpVerified: {
    //     type: Boolean,
    // //     default: false
    // },
    isVerified: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
}
);
module.exports = mongoose.model("User", userSchema);



   

