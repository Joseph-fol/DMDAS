const User = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

require("dotenv").config()
const jwtSecretKey = process.env.jwtSecretKey

const userSignup = (req, res) => {
    const { fullName, email, matricNumber, department, phoneNumber, level, pin, role } = req.body
    console.log(req.body)

    if (!fullName || !email || !matricNumber || !department || !phoneNumber || !level || !pin) {
        return res.status(400).json({
            message: "All input fields are required"
        })
    }

    User.findOne({ email: req.body.email })
        .then((userExists) => {
            if (userExists) {
                console.log("User already exists");
                return res.status(409).json({
                    message: "User already exists",
                    email: userExists.email
                })
            }

            const salt = bcrypt.genSaltSync(10)
            const hashedPin = bcrypt.hashSync(req.body.pin, salt)

            const userInformation = {
                fullName,
                email,
                matricNumber,
                department,
                phoneNumber,
                level,
                pin: hashedPin,
                role: role === 'rep' ? 'rep' : 'student' // Explicitly set role
            };
            const newUserInformation = new User(userInformation);
            const token = jwt.sign({ matricNumber }, `${jwtSecretKey}`, { expiresIn: "1hr" })
            return newUserInformation.save()
                .then(() => {
                    res.status(201).json({
                        status: "Successful",
                        message: "User details successfully saved",
                        token
                    })
                    console.log("User details successfully saved")
                })
                .catch((error) => {
                    console.log("Failed to save student details", error)
                    return res.status(500).json({
                        message: "Failed to save student details",
                        error: error.message
                    })
                })
        })
        .catch((error) => {
            console.error("Error during signup:", error.message);
            return res.status(500).json({
                message: "Signup failed",
                error: error.message
            })
        })
}

const userSignin = (req, res) => {
    const { pin, matricNumber } = req.body
    User.findOne({ matricNumber })
        .then((foundUser) => {
            if (!foundUser) {
                console.log("Invalid matric number")
                return res.status(401).json({
                    message: "Invalid Matric Number or pin"
                })
            }
            else {
                // Verify that the pin matches the hashed pin in the database
                return bcrypt.compare(pin, foundUser.pin)
                    .then((isMatch) => {
                        if (!isMatch) {
                            return res.status(401).json({
                                message: "Invalid Matric Number or pin"
                            })
                        } else {
                            const token = jwt.sign({ matricNumber }, `${jwtSecretKey}`, { expiresIn: "1hr" })
                            console.log("User successfully sign in");
                            return res.status(200).json({
                                message: "User successfully signin",
                                id: foundUser._id, 
                                email: foundUser.email,
                                level: foundUser.level,
                                department: foundUser.department,
                                role: foundUser.role,
                                token
                            })
                        }

                    })
            }
        })
        .catch((error) => {
            console.log("Error during signin", error)
            res.status(500).json("Internal Server Error")
        })
}

const forgotPin = (req, res) => {
    const { matricNumber, email, newPin, confirmPin } = req.body;
    if (!matricNumber || !email || !newPin || !confirmPin) {
        return res.status(400).json({
            message: "All input fields are required"
        });
    }

    if (newPin !== confirmPin) {
        return res.status(400).json({
            message: "New PIN and confirm PIN do not match"
        });
    }

    User.findOne({ matricNumber, email })
        .then((foundUser) => { 
            if (!foundUser) {
                return res.status(404).json({
                    message: "User not found with the provided matric number and email"
                });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPin = bcrypt.hashSync(newPin, salt);
            
            return User.findByIdAndUpdate(foundUser._id, { pin: hashedPin }, { new: true })
                .then((updatedUser) => {
                    return res.status(200).json({
                        message: "PIN successfully changed",
                        user: {
                            id: updatedUser._id,
                            fullName: updatedUser.fullName,
                            email: updatedUser.email
                        }
                    });
                });
        })
        .catch((error) => {
            console.error("Error during PIN reset:", error);
            res.status(500).json({ message: "Internal Server Error" });
        });
};

module.exports = { userSignup, userSignin, forgotPin };
// http://localhost:3142/api/changePin/6a2c1a43430f7641c6c48926

// {
//   "oldPin": "1234",
//   "newPin": "5678",
//   "confirmPin": "5678"
// }


// {
//   "fullName": "Akorede Olujoye Taiwo",
//   "email": "akoeredeolujoye@gmail.com",
//   "matricNumber": "2024002979",
//   "department": "Civil Engineering",
//   "phoneNumber": "08058999245",
//   "level": "200",
//   "pin": "1515"
// }

// {
//   "matricNumber": "2022005587",
//   "pin": "2321"
// }
