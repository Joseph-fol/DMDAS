const express = require("express")
const router = express.Router()
const { verifyToken, isRep } = require("../middleware/auth")
const {userSignup, userSignin, requestPinReset, resetPinWithOTP, initializeTransaction, verifyTransaction} = require("../controllers/user.controller")

router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/requestPin", requestPinReset)
router.post("/resetPin", resetPinWithOTP)
router.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});
router.post("/initializeTransaction", verifyToken, initializeTransaction)
router.post("/paystack/webhook", verifyTransaction)


router.get("/admin/dashboard", verifyToken, isRep, (req, res) => {
    res.status(200).json({ message: `Welcome to the admin dashboard, ${req.user.fullName}!` });
});

module.exports = router;
