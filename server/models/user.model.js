const mongoose = require("mongoose")

let userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    matricNumber: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["rep", "student"],
        default: "student"
    },
    pinResetOTP: {
        type: String
    },
    pinResetExpires: {
        type: Date
    }
}, {timestamps: true})

module.exports = mongoose.model("User", userSchema)