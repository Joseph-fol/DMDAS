const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Transaction = require("../models/transaction.model");
const AddManual = require("../models/manual.model")

const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();
const jwtSecretKey = process.env.jwtSecretKey;

const userSignup = async (req, res) => {
  const { fullName, email, matricNumber, department, phoneNumber, level, pin, role } = req.body;
  if (!fullName || !email || !matricNumber || !department || !phoneNumber || !level || !pin || !role) {
    return res.status(400).json({
      message: "All input fields are required",
    });
  }

  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      console.log("User already exists");
      return res.status(409).json({
        message: "User already exists",
        email: userExists.email,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    const newUserInformation = new User({
      fullName,
      email,
      matricNumber,
      department,
      phoneNumber,
      level,
      pin: hashedPin,
      role: role === "rep" ? "rep" : "student",
    });

    await newUserInformation.save();
    console.log("User details successfully saved");

    const token = jwt.sign({ matricNumber }, jwtSecretKey, { expiresIn: "1hr" });
    return res.status(201).json({
      status: "Successful",
      message: "User details successfully saved",
      token,
    });

  } catch (error) {
    console.error("Error during signup:", error.message);
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

const userSignin = async (req, res) => {
  const { pin, matricNumber } = req.body;
  if (!pin || !matricNumber) {
    return res.status(400).json({
      message: "Matric number and pin are required",
    });
  }

  try {
    const foundUser = await User.findOne({ matricNumber })
    if (!foundUser) {
      console.log("Invalid matric number");
      return res.status(401).json({
        message: "Invalid Matric Number or pin",
      });
    }

    const isMatch = await bcrypt.compare(pin, foundUser.pin)
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Matric Number or pin",
      });
    }

    const token = jwt.sign({ matricNumber }, `${jwtSecretKey}`, { expiresIn: "1hr" });
    console.log("User successfully sign in");
    return res.status(200).json({
      message: "User successfully signin",
      name: foundUser.fullName,
      matricNumber: foundUser.matricNumber,
      id: foundUser._id,
      email: foundUser.email,
      level: foundUser.level,
      department: foundUser.department,
      role: foundUser.role,
      token,
    });
  } catch (error) {
    console.log("Error during signin", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const requestPinReset = async (req, res) => {
  const { matricNumber, email } = req.body;
  if (!matricNumber || !email) {
    return res.status(400).json({
      message: "Matric number and email are required.",
    });
  }

  try {
    const user = await User.findOne({ matricNumber, email });
    if (!user) {
      return res.status(404).json({
        message: "User not found with the provided matric number and email.",
      });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.pinResetOTP = generatedOTP;
    user.pinResetExpires = Date.now() + 600000; // OTP expires in 10 minutes
    await user.save();

    await client.messages.create({
      from: "whatsapp:+14155238886", // Your Twilio WhatsApp number
      to: `whatsapp:+2348125831469`, // Replace with user.phoneNumber in production
      body: `Your DMDAS verification code is ${generatedOTP}. It will expire in 10 minutes.`,
    });

    console.log(`OTP sent to ${user.matricNumber}`);

    res.status(200).json({
      message: "OTP has been sent to your registered WhatsApp number.",
    });
  } catch (error) {
    console.error("Error during requestPinReset:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


const resetPinWithOTP = async (req, res) => {
  const { matricNumber, otp, newPin, confirmPin } = req.body;

  if (!matricNumber || !otp || !newPin || !confirmPin) {
    return res.status(400).json({ message: "All fields of the inputs are required." });
  }

  if (newPin !== confirmPin) {
    return res.status(400).json({ message: "New PIN and confirm PIN do not match." });
  }

  try {
    const user = await User.findOne({
      matricNumber, // Ensure we're updating the correct user
      pinResetOTP: otp,
      pinResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(newPin, salt);
    user.pinResetOTP = undefined;
    user.pinResetExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Your PIN has been successfully reset." });
    
  } catch (error) {
    console.error("Error during resetPinWithOTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const createVirtualAccount = async (req, res) => {
//   const finswitzBaseURL = "https://finswitz.com"
//   const headers = {
//       Authorization: `Bearer ${process.env.FINSWTIZ_API_KEY}`,
//       "Content-Type": "application/json"
//   }

//   const { email, fullName, matricNumber } = req.user;

//   try{
//         const response = await axios.post(`${finswitzBaseURL}/virtual-accounts`, {
//           email, 
//           reference: orderId,
//           currency: "NGN"
//         }, {
//           headers
//         })
//         return response.data
//         console.log(response)
//     } catch(error){
//       console.error("Finswitz account creation failed", error.response)
//     }
// }



const getUserProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addManual = async (req, res) => {
  const { courseCode, courseTitle, price, quantity } = req.body;
  // The logged-in user's ID is attached to the request by the verifyToken middleware
  const repId = req.user._id;

  if (!courseCode || !courseTitle || !price || !quantity) {
    return res.status(400).json({
      message: "All manual fields are required."
    });
  }

  try {
    const newManual = await AddManual.create({
      courseCode,
      courseTitle,
      price,
      quantity,
      addedBy: repId, // Associate the manual with the rep
    });

    return res.status(201).json({
      message: "Manual successfully added.",
      manual: newManual,
    });
  } catch (error) {
    console.error("Error adding manual:", error);
    if (error.code === 11000) { // Handle duplicate course code error
      return res.status(409).json({ message: `A manual with course code '${courseCode}' already exists.` });
    }
    return res.status(500).json({
      message: "Error adding manual",
      error: error.message,
    });
  }
};

const getRepManuals = async (req, res) => {
  try {
    const manuals = await AddManual.find({ addedBy: req.user._id }).populate('addedBy', 'fullName email phoneNumber');
    if (manuals.length === 0) {
      console.log("No manuals found for this representative.");
      return res.status(200).json(
        { 
          status: false,
          message: "No manuals found for this representative.",
          manuals: [] 
        },
      );
    }
    
    console.log("Rep manuals fetched successfully");
    return res.status(200).json({ manuals });

  } catch (error) {
    console.error("Error fetching rep manuals:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  userSignup,
  userSignin,
  requestPinReset,
  resetPinWithOTP,
  // initializeTransaction,
  // verifyTransaction,
  getUserProfile,
  addManual,
  getRepManuals
};
// http://localhost:3142/api/changePin/6a2c1a43430f7641c6c48926

// {
//   "fullName": "Ishola Isaiah Taiwo",
//   "email": "isholaisaiah43@gmail.com",
//   "matricNumber": "2022007890",
//   "department": "CPE",
//   "phoneNumber": "08123223232",
//   "level": "400level",
//   "pin": "2005",
//   "role": "rep"
// }

// {
//   "amount": 2000,
//   "courseCode": "CPE 304"
// }

// {
//   "matricNumber": "2022007890",
//   "pin": "2005",
//  "role": "student"
// }

//   "matricNumber": "2022003675",
//   "pin": "2701",

// {
//   "courseCode": "CPE 401",
//   "courseTitle": "Artificial Intelligence",
//   "price": 3500,
//   "quantity": 100, }

// {
//   "fullName": "Ojedapo Ibukunoluwa Mercy",
//   "email": "ojedapoibukunoluwa@gmail.com",
//   "matricNumber": "2022003675",
//   "department": "Computer Engineering",
//   "phoneNumber": "09025220892",
//   "level": "500",
//   "pin": "2701",
//   "role": "rep",
// }
