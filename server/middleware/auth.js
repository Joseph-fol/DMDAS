const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
require("dotenv").config();
const jwtSecretKey = process.env.jwtSecretKey;

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: false,
                message: "Authentication token is required. Please login."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecretKey);
        const user = await User.findOne({ matricNumber: decoded.matricNumber }).select("-pin");

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User associated with this token no longer exists."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ status: false, message: "Invalid or expired token. Please login again." });
    }
};

const isRep = (req, res, next) => {
    if (req.user && req.user.role === 'rep') {
        next();
    } else {
        return res.status(403).json({
            status: false,
            message: "Access denied. You do not have permission to perform this action."
        });
    }
};

module.exports = { verifyToken, isRep };