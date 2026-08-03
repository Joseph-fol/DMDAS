const mongoose = require("mongoose")

const manualSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: [true, "Course title is required"],
        trim: true,
    },
    courseCode: {
        type: String,
        required: [true, "Course code is required"],
        unique: true,
        index: true, 
        uppercase: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    semester: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true })

// Compound index to quickly filter marketplace manuals by department + level + availability
manualSchema.index({ department: 1, level: 1, isAvailable: 1 });

const Manual = mongoose.model("Manual", manualSchema)
module.exports = Manual