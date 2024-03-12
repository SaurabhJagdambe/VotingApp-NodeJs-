const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, genrateToken } = require("../jwt");

// Post Method for User  SignUP
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //Assuming the request body contains the User data

    //Validations
    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same Aadhar Card Number already exists",
      });
    }

    // Create new user Document using Mongoose model
    const newUser = new User(data);

    //save new user to database
    const response = await newUser.save();
    console.log("data saved");

    //Genrate JWT Token
    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = genrateToken(payload);
    console.log("Token is: ", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//LOgin Route
router.post("/login", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from req body
    const { aadharCardNumber, password } = req.body;

    //find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //if user not exist
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid AadharCard Number or Paasword" });
    }

    //Genrate JWT Token
    const payload = {
      id: user.id,
    };

    const token = genrateToken(payload);
    //return token as response
    res.json({ token });
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal server Error" });
  }
});

// Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update the data by id
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.params.id; //Extract id from token
    const { currentPass, newPass } = req.body; //Extract Current and New Pass from request body

    // find the user by userId
    const user = await User.findById(userId);

    //if Password dose not match return Error
    if (!user || !(await user.comparePassword(currentPass))) {
      return res
        .status(401)
        .json({ error: "invalid AadharCard Number or Paasword" });
    }

    //Update the Users Password
    user.password = newPass;
    await user.save();

    console.log("Password Updated");
    res.status(200).json({ message: "Password Updated !!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

module.exports = router;
