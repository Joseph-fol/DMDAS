const mongoose = require("mongoose")

let userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Fullname is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    matricNumber: {
        type: String,
        required: [true, "Matric Number is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },
    level: {
        type: String,
        required: [true, "Academic level is required"],
        enum: ["100", "200", "300", "400", "500"],
        index: true
    },
    pin: {
        type: String,
        required: [true, "Pin is required"],
        trim: true
    },
    role: {
        type: String,
        enum: ["rep", "student"],
        default: "student",
        required: true
    },
    pinResetOTP: {
        type: String
    },
    pinResetExpires: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)