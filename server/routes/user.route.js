const express = require("express")
const router = express.Router()
const { verifyToken, isRep } = require("../middleware/auth")
const {userSignup, userSignin, forgotPin} = require("../controllers/user.controller")

// Public routes - No token required
router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/forgotPin", forgotPin)

// Example of a protected route for any authenticated user
router.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});

// Example of a protected route ONLY for representatives/admins
router.get("/admin/dashboard", verifyToken, isRep, (req, res) => {
    res.status(200).json({ message: `Welcome to the admin dashboard, ${req.user.fullName}!` });
});

module.exports = router;
