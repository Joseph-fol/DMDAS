const express = require("express")
const router = express.Router()
const { verifyToken, isRep, isStudent } = require("../middleware/auth")
const {userSignup, userSignin, requestPinReset, resetPinWithOTP, addManual, getRepManuals, resetPasswordSetting, editManual, deleteManual} = require("../controllers/user.controller")
const { initializeTransaction, verifyTransaction } = require("../controllers/paystack")
const {uploadProfilePicture} = require("../controllers/uploadProfilePicture")


router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/requestPin", requestPinReset)
router.post("/resetPin", resetPinWithOTP)
router.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});
router.post("/updatePinSetting", verifyToken, resetPasswordSetting)
router.post("/initializeTransaction", verifyToken, initializeTransaction)
router.post("/paystack/webhook", verifyTransaction)
router.get("/admin/dashboard", verifyToken, isRep, (req, res) => {
    res.status(200).json({ message: `Welcome to the admin dashboard, ${req.user.fullName}!` });
});

router.post("/avatar/upload", verifyToken, uploadProfilePicture)

// Routes for Representatives to manage manuals
router.post("/rep/addManuals", verifyToken, isRep, addManual)
router.get("/rep/getManual", verifyToken, isRep, getRepManuals)
router.put("/rep/editManual/:id", verifyToken, isRep, editManual)
router.delete("/rep/deleteManual/:id", verifyToken, isRep, deleteManual)

module.exports = router;
