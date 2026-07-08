const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    matricNumber: {
        type: String,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    reference: {
        type: String,
        required: true,
        unique: true
    },
    
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

}, {timestamps: true})

module.exports = mongoose.model("Transaction", transactionSchema)