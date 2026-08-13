const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Transaction = require("../models/transaction.model");
const { fetchPaystackBanks } = require("./paystack");
const { sendWelcomeEmail, sendPinResetEmail } = require("../util/emailService");
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

    // Sanitize the level input to store only the numeric part (e.g., "400" from "400level")
    const sanitizedLevel = level.match(/\d+/)?.[0] || level;

    const newUserInformation = new User({
      fullName,
      email,
      matricNumber,
      department,
      phoneNumber,
      level: sanitizedLevel,
      pin: hashedPin,
      role: role === "rep" ? "rep" : "student",
    });

    await newUserInformation.save();
    console.log("User details successfully saved");

    try {
      await sendWelcomeEmail(newUserInformation.email, newUserInformation.fullName);
      console.log(`Welcome email sent to ${newUserInformation.email}`);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError.message);
    }

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

const requestPinResetByEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "Email is required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`PIN reset request for non-existent email: ${email}`);
      return res.status(200).json({
        message: "If an account with this email exists, a PIN reset code has been sent.",
      });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.pinResetOTP = generatedOTP;
    user.pinResetExpires = Date.now() + 600000; // OTP expires in 10 minutes
    await user.save();

    await sendPinResetEmail(user.email, user.fullName, generatedOTP);

    console.log(`PIN reset OTP sent to ${user.email}`);
    res.status(200).json({
      message: "A PIN reset code has been sent to your registered email address.",
    });
  } catch (error) {
    console.error("Error during requestPinResetByEmail:", error);
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

const resetPasswordSetting = async (req, res) => {
  const matricNumber = req.user.matricNumber
  const { currentPin, newPin, confirmNewPin } = req.body

  if (!currentPin || !newPin || !confirmNewPin) {
    return res.status(400).json({
      message: "All input fields are required"
    })
  }

  if (newPin !== confirmNewPin) {
    return res.status(400).json({ message: "New PIN and confirm PIN do not match." });
  }

  try {
    // Fetch the full user document including the pin
    const userDetails = await User.findOne({ matricNumber })

    const isMatch = await bcrypt.compare(currentPin, userDetails.pin)
    if (!isMatch) {
      console.log("Current pin does not match the original pin")
      return res.status(404).json({
        status: false,
        message: "Current pin does not correlate with the original pin"
      })
    }

    const salt = await bcrypt.genSalt(10);
    userDetails.pin = await bcrypt.hash(newPin, salt);

    userDetails.pinResetOTP = undefined;
    userDetails.pinResetExpires = undefined;

    await userDetails.save();
    res.status(200).json({ message: "PIN has been reset successfully." });
  } catch (error) {
    console.log("Error during resetPasswordSetting", error)
    res.status(500).json({
      message: "Internal Server Error",
      details: "Failed to retrieve user pin"
    })
  }
}



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
  const { courseCode, courseTitle, price, printedStock, semester } = req.body;
  // The logged-in user's ID is attached to the request by the verifyToken middleware
  const repId = req.user._id;

  if (!courseCode || !courseTitle || !price || !semester) {
    return res.status(400).json({
      message: "All manual fields are required."
    });
  }

  try {
    const newManual = await AddManual.create({
      courseCode,
      courseTitle,
      price,
      printedStock,
      semester,
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

const editManual = async (req, res) => {
  const { id } = req.params
  const repId = req.user._id
  const { courseCode, courseTitle, price, printedStock, semester } = req.body;

  if (!courseCode || !courseTitle || !price || !printedStock || !semester) {
    return res.status(400).json({
      message: "All manual fields are required."
    });
  }

  try {
    const manual = await AddManual.findById(id);
    if (!manual) {
      return res.status(404).json({
        message: "Manual not found"
      })
    }

    // Ensure the rep editing the manual is the one who added it
    if (manual.addedBy.toString() !== repId.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only edit manuals you have added."
      })
    }

    const manualUpdates = {
      courseCode,
      courseTitle,
      price,
      printedStock,
      semester,
    }

    const editedManual = await AddManual.findByIdAndUpdate(id, manualUpdates, { new: true })

    res.status(200).json({
      message: "Manual successfully updated.",
      manual: editedManual
    })
  } catch (error) {
    console.log("Error editing manual")
    return res.status(500).json({
      message: "Failed to update manual",
      error: error.message
    })
  }
}

const deleteManual = async (req, res) => {
  const { id } = req.params
  const repId = req.user._id

  try {
    const manual = await AddManual.findById(id);
    if (!manual) {
      return res.status(404).json({
        message: "Manual not found."
      })
    }

    // Ensure the rep deleting the manual is the one who added it
    if (manual.addedBy.toString() !== repId.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only delete manuals you have added."

      })
    }

    // Now, proceed with deletion
    await AddManual.findByIdAndDelete(id);

    res.status(200).json({
      message: "Manual successfully deleted.",
    })
  } catch (error) {
    console.log("Error deleting manual:", error)
    return res.status(500).json({
      message: "Failed to delete manual.",
      error: error.message
    })
  }
}

const getRepManuals = async (req, res) => {
  try {
    const manuals = await AddManual.find({ addedBy: req.user._id })
      .select("courseCode courseTitle semester price isAvailable printedStock claimedCount availableStock stockStatus")
      .populate('addedBy', 'fullName email phoneNumber'); // Populate only relevant user fields

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

const searchManual = async (req, res) => {
  try {
    const q = req.body.q ?? req.query.q ?? "";
    const semester = req.body.semester ?? req.query.semester;
    const { department, level } = req.user; // The student's department and level

    // 1. Find all 'rep' users who belong to the student's department and level.
    const repsInDepartment = await User.find({ department, level, role: 'rep' }).select('_id');
    const repIds = repsInDepartment.map(rep => rep._id);

    // 2. Build the query for manuals.
    const buildQuery = (restrictToDepartmentReps) => {
      const query = { isAvailable: true };

      if (restrictToDepartmentReps && repIds.length > 0) {
        query.addedBy = { $in: repIds };
      }

      if (q && q.trim().length > 0) {
        const searchTerm = q.trim();
        const searchRegex = new RegExp(searchTerm, "i");

        query.$or = [{ courseCode: searchRegex }, { courseTitle: searchRegex }];
      }

      if (semester) {
        query.semester = semester;
      }

      return query;
    };

    // Try department reps first, then fall back to all available manuals.
    let manuals = await AddManual.find(buildQuery(true))
      .select("courseCode courseTitle semester price isAvailable printedStock claimedCount availableStock stockStatus")
      .sort({ courseCode: 1 })
      .lean();

    if (manuals.length === 0) {
      manuals = await AddManual.find(buildQuery(false))
        .select("courseCode courseTitle semester price isAvailable printedStock claimedCount availableStock stockStatus addedBy")
        .sort({ courseCode: 1 })
        .lean();
    }

    return res.status(200).json({
      success: true,
      count: manuals.length,
      data: manuals,
    });
  } catch (error) {
    console.error("[Manual search error]", error.message);
    return res.status(500).json({ success: false, message: "Failed to search for manuals." });
  }
};

const getDepartmentLevelManuals = async (req, res) => {
  try {
    const { department, level } = req.user; // Get student's department and level from authenticated user

    if (!department || !level) {
      return res.status(400).json({
        success: false,
        message: "Student department or level not found in user data.",
      });
    }

    // 1. Find all 'rep' users who belong to the student's department and level.
    const relevantReps = await User.find({
      department,
      level,
      role: 'rep'
    }).select('_id');

    const repIds = relevantReps.map(rep => rep._id);

    if (repIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: `No representatives found for your department (${department}) and level (${level}).`
      });
    }

    // 2. Find manuals added by these specific representatives that are available.
    const manuals = await AddManual.find({ addedBy: { $in: repIds }, isAvailable: true })
      .select("courseCode courseTitle semester price isAvailable printedStock claimedCount availableStock stockStatus")
      .sort({ courseCode: 1 })
      .lean();

    return res.status(200).json({ success: true, count: manuals.length, data: manuals });
  } catch (error) {
    console.error("[getDepartmentLevelManuals error]", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch manuals for your department and level." });
  }
};

const resolveAccountDetail = async (req, res) => {
  const { accountNumber, bankName } = req.body;

  if (!accountNumber || !bankName) {
    return res.status(400).json({
      message: "Account number and bank name are required."
    });
  }

  try {
    const banksData = await fetchPaystackBanks();
    const bank = banksData.find(b => b.name.toLowerCase() === bankName.toLowerCase());

    if (!bank) {
      return res.status(200).json({
        verificationFailed: true,
        message: "Automatic verification failed for this bank. Please enter your account name manually.",
        accountNumber,
        bankName,
      });
    }

    const bankCode = bank.code;

    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    const data = await response.json();
    if (!data.status) {
      if ((data.message || "").toLowerCase().includes("could not resolve account")) {
        return res.status(200).json({
          verificationFailed: true,
          message: "Automatic verification failed. Please enter your account name manually.",
          accountNumber,
          bankName: bank.name,
        });
      }

      return res.status(400).json({ message: data.message || "Could not validate account details." });
    }

    res.status(200).json({
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
      bankName: bank.name,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error while resolving account details", error: error.message });
  }
}

const saveAccountDetail = async (req, res) => {
  const { accountNumber, accountName, bankName } = req.body;

  if (!accountNumber || !accountName || !bankName) {
    return res.status(400).json({
      message: "Account number, account name, and bank name are required."
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    const banksData = await fetchPaystackBanks();

    const bank = banksData.find(b => b.name.toLowerCase() === bankName.toLowerCase());

    user.settlementAccount = {
      accountNumber: accountNumber,
      accountName: accountName,
      bankName: bank ? bank.name : bankName,
      bankCode: bank ? bank.code : null,
    };

    await user.save();

    res.status(200).json({
      message: "Account details saved successfully.",
      accountDetails: user.settlementAccount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while saving account details", error: error.message });
  }
};

const editBankDetails = async (req, res) => {
  const repId = req.user._id;
  const {accountNumber, account } = req.body
}

const validateToken = async (req, res) => {
  const { token } = req.body
  if (!token) {
    return res.status(400).json({
      message: "Input field is required"
    })
  }
}

const deleteUserAccount = async() =>{
}


module.exports = {
  userSignup,
  userSignin,
  requestPinReset,
  requestPinResetByEmail,
  resetPinWithOTP,
  getUserProfile,
  addManual,
  getRepManuals,
  resetPasswordSetting,
  editManual,
  deleteManual,
  searchManual,
  resolveAccountDetail,
  saveAccountDetail,
  editBankDetails,
  getDepartmentLevelManuals, // Export the new function
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

//  "_id": "6a75e43efce3d6a38054eef6",
//       "courseTitle": "Prototyping Techniques",
//       "courseCode": "CPE 405",
//       "price": 2600,
//       "semester": "Harmattan",
//       "printedStock": 0,
//       "claimedCount": 0,

// {
//   "accountNumber": "2332360360",
//   "bankName": "United Bank for Africa"
// }