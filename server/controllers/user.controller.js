const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

  if (!fullName || !email || !matricNumber || !department || !phoneNumber || !level || !pin || !role) {
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

const initializeTransaction = async (req, res) => {
  const payStackBaseURL = "https://api.paystack.co";
  const { email, fullName, matricNumber } = req.user; // Get user info from the verified token
  const { amount, courseCode } = req.body;

  if (!amount || !courseCode) {
    return res.status(400).json({ message: "Amount and courseCode are required." });
  }

  try {
    // Initialize a transaction on Paystack
    const transactionResponse = await fetch(`${payStackBaseURL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: amount * 100, // Paystack amount is in kobo
        metadata: {
          fullName: fullName,
          matricNumber: matricNumber,
          courseCode: courseCode,
        },
      }),
    });

    const transactionData = await transactionResponse.json();

    if (!transactionResponse.ok || !transactionData.status || !transactionData.data.reference) {
        console.error("Paystack Error initializing transaction:", transactionData);
        return res.status(transactionResponse.status).json({ message: "Failed to initialize transaction.", details: transactionData.message });
    }

    // Create a new transaction record in your database
    const newTransaction = new Transaction({
      user: req.user._id,
      matricNumber: matricNumber,
      amount: amount,
      courseCode: courseCode,
      reference: transactionData.data.reference,
      status: 'pending',
    });

    await newTransaction.save();
    console.log(`Transaction pending for ${matricNumber} with reference ${transactionData.data.reference}`);

    return res.status(200).json(transactionData);
  } catch (error) {
    console.error("Error during transaction initialization:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const verifyTransaction = async (req, res) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    console.error("Webhook Error: Invalid signature");
    return res.sendStatus(400); // Invalid signature
  }

  const event = req.body;

  // Check for a successful charge event
  if (event.event === 'charge.success') {
    const reference = event.data.reference;

    try {
      // Find the transaction in your database
      const transaction = await Transaction.findOne({ reference: reference });
      if (!transaction) {
        console.error(`Webhook Error: Transaction with reference ${reference} not found.`);
        return res.sendStatus(404);
      }

      // Verify the transaction status with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });

      const verificationData = await verifyResponse.json();

      if (verificationData.data && verificationData.data.status === 'success') {
        // Update transaction status to 'successful'
        transaction.status = 'successful';
        await transaction.save();
        console.log(`Transaction ${reference} successfully verified and updated.`);
      } else {
        console.warn(`Webhook Warning: Transaction ${reference} verification failed or status not 'success'.`);
      }
    } catch (error) {
      console.error(`Webhook Error processing reference ${reference}:`, error);
      return res.sendStatus(500);
    }
  }

  // Acknowledge receipt of the event
  res.sendStatus(200);
};

module.exports = {
  userSignup,
  userSignin,
  requestPinReset,
  resetPinWithOTP,
  initializeTransaction,
  verifyTransaction,
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
//   "pin": "2005"
// }
