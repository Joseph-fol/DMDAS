const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Transaction = require("../models/transaction.model");

const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const client = require("twilio")(accountSid, authToken);

require("dotenv").config();
const jwtSecretKey = process.env.jwtSecretKey;

const userSignup = (req, res) => {
  const {
    fullName,
    email,
    matricNumber,
    department,
    phoneNumber,
    level,
    pin,
    role,
  } = req.body;
  console.log(req.body);

  if (
    !fullName ||
    !email ||
    !matricNumber ||
    !department ||
    !phoneNumber ||
    !level ||
    !pin
  ) {
    return res.status(400).json({
      message: "All input fields are required",
    });
  }

  User.findOne({ email: req.body.email })
    .then((userExists) => {
      if (userExists) {
        console.log("User already exists");
        return res.status(409).json({
          message: "User already exists",
          email: userExists.email,
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPin = bcrypt.hashSync(req.body.pin, salt);

      const userInformation = {
        fullName,
        email,
        matricNumber,
        department,
        phoneNumber,
        level,
        pin: hashedPin,
        role: role === "rep" ? "rep" : "student",
      };

      const newUserInformation = new User(userInformation);
      const token = jwt.sign({ matricNumber }, `${jwtSecretKey}`, {
        expiresIn: "1hr",
      });
      return newUserInformation
        .save()
        .then(() => {
          res.status(201).json({
            status: "Successful",
            message: "User details successfully saved",
            token,
          });
          console.log("User details successfully saved");
        })
        .catch((error) => {
          console.log("Failed to save student details", error);
          return res.status(500).json({
            message: "Failed to save student details",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.error("Error during signup:", error.message);
      return res.status(500).json({
        message: "Signup failed",
        error: error.message,
      });
    });
};

const userSignin = (req, res) => {
  const { pin, matricNumber } = req.body;
  User.findOne({ matricNumber })
    .then((foundUser) => {
      if (!foundUser) {
        console.log("Invalid matric number");
        return res.status(401).json({
          message: "Invalid Matric Number or pin",
        });
      } else {
        // Verify that the pin matches the hashed pin in the database
        return bcrypt.compare(pin, foundUser.pin).then((isMatch) => {
          if (!isMatch) {
            return res.status(401).json({
              message: "Invalid Matric Number or pin",
            });
          } else {
            const token = jwt.sign({ matricNumber }, `${jwtSecretKey}`, {
              expiresIn: "1hr",
            });
            console.log("User successfully sign in");
            return res.status(200).json({
              message: "User successfully signin",
              id: foundUser._id,
              email: foundUser.email,
              level: foundUser.level,
              department: foundUser.department,
              role: foundUser.role,
              token,
            });
          }
        });
      }
    })
    .catch((error) => {
      console.log("Error during signin", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const requestPinReset = (req, res) => {
  const { matricNumber, email } = req.body;
  if (!matricNumber || !email) {
    return res.status(400).json({
      message: "Matric number and email are required.",
    });
  }

  User.findOne({ matricNumber, email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found with the provided matric number and email.",
        });
      }

      const generatedOTP = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const otpExpires = Date.now() + 600000; // OTP expires in 10 minutes
      const userPhoneNumber = user.phoneNumber;

      user.pinResetOTP = generatedOTP;
      user.pinResetExpires = otpExpires;

      user
        .save()
        .then(() => {
          // const userPhoneNumber = `+${user.phoneNumber}`;
          return client.messages.create({
            from: "whatsapp:+14155238886", // Your Twilio WhatsApp number
            to: `whatsapp:+234${userPhoneNumber}`,
            // to: `whatsapp:+2348125831469`,
            body: `Your DMDAS verification code is ${generatedOTP}. It will expire in 10 minutes.`,
          });
        })

        .then(() => {
          console.log(`OTP sent to ${user.matricNumber}`);
          res.status(200).json({
            message: "OTP has been sent to your registered WhatsApp number.",
          });
        })
        .catch((error) => {
          console.error("Error during requestPinReset:", error);
          res.status(500).json({ message: "Internal Server Error" });
        });
    })

    .catch((error) => {
      console.error("Error during requestPinReset:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const resetPinWithOTP = (req, res) => {
  const { matricNumber, email, otp, newPin, confirmPin } = req.body;

  if (!matricNumber || !email || !otp || !newPin || !confirmPin) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newPin !== confirmPin) {
    return res
      .status(400)
      .json({ message: "New PIN and confirm PIN do not match." });
  }

  User.findOne({
    matricNumber,
    email,
    pinResetOTP: otp,
    pinResetExpires: { $gt: Date.now() }, // Check if OTP is not expired
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }

      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(newPin, salt))
        .then((hashedPin) => {
          user.pin = hashedPin;
          user.pinResetOTP = undefined;
          user.pinResetExpires = undefined;
          return user.save();
        })
        .then(() => {
          res
            .status(200)
            .json({ message: "Your PIN has been successfully reset." });
        })
        .catch((error) => {
          console.error("Error during resetPinWithOTP:", error);
          res.status(500).json({ message: "Internal Server Error" });
        });
    })
    .catch((error) => {
      console.error("Error during resetPinWithOTP:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const initialiatePayment = (req, res) => {
  const payStackBaseURL = "https://api.paystack.co";

  const { matricNumber, amount, courseCode } = req.body;
  if (!matricNumber || !amount || !courseCode) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const existingTx = Transaction.findOne({
    matricNumber,
    courseCode,
    status: { $in: ["verified", "completed"] },
  });
  if (existingTx) {
    return res
      .status(400)
      .json({ message: "You have already paid for this course manual." });
  }

  const studentEmail = `${matricNumber}@gmail.com`;

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  fetch(`${payStackBaseURL}/transaction/initialize`, {
    method: "POST",
    headers: "headers",
    body: JSON.stringify({
      email: studentEmail,
      firstName: "Student",
      lastName: matricNumber,
      phoneNumber: `+234${phoneNumber}`,
    }),
  });
};
module.exports = {
  userSignup,
  userSignin,
  requestPinReset,
  resetPinWithOTP,
};
// http://localhost:3142/api/changePin/6a2c1a43430f7641c6c48926
