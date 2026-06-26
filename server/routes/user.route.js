const express = require("express")
const router = express.Router()
const {userSignup, userSignin, forgotPin, verifyToken} = require("../controllers/user.controller")

router.post("/signup", userSignup)
router.post("/signin", userSignin)
router.post("/forgotPin", forgotPin)
router.get("/verifyToken", verifyToken)

module.exports = router;
