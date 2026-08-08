const express = require("express")
const router = express.Router()
const { verifyToken, isRep, isStudent } = require("../middleware/auth")
const {userSignup, userSignin, requestPinReset, requestPinResetByEmail, resetPinWithOTP, addManual, getRepManuals, resetPasswordSetting, editManual, deleteManual, searchManual, resolveAccountDetail, saveAccountDetail, editBankDetails} = require("../controllers/user.controller")
const { initializeTransaction, verifyTransaction, getBankDetails } = require("../controllers/paystack")
const {uploadProfilePicture} = require("../controllers/uploadProfilePicture")


router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/requestPin", requestPinReset) // For WhatsApp
router.post("/requestPinByEmail", requestPinResetByEmail) // For Email
router.post("/resetPin", resetPinWithOTP)
router.get("/profile", verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});
router.put("/updatePinSetting", verifyToken, resetPasswordSetting)
router.post("/initializeTransaction", verifyToken, initializeTransaction)
router.post("/paystack/webhook", verifyTransaction)
router.get("/admin/dashboard", verifyToken, isRep, (req, res) => {
    res.status(200).json({ message: `Welcome to the admin dashboard, ${req.user.fullName}!` });
});

router.get("/banks", getBankDetails)


// Upload Profile Picture
router.post("/avatar/upload", verifyToken, uploadProfilePicture)

// Routes for Representatives to manage manuals
router.post("/rep/addManual", verifyToken, isRep, addManual)
router.get("/rep/getManual", verifyToken, isRep, getRepManuals)
router.put("/rep/editManual/:id", verifyToken, isRep, editManual)
router.delete("/rep/deleteManual/:id", verifyToken, isRep, deleteManual)
router.post("/rep/resolveAccount", verifyToken, isRep, resolveAccountDetail)
router.post("/rep/saveAccount", verifyToken, isRep, saveAccountDetail)
router.post("/rep/editBankDetails/", verifyToken, isRep, editManual)

// Route for students to search for manuals
router.post("/rep/searchManuals", verifyToken, isRep, searchManual)

module.exports = router;
