const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// define the persons Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  // hash pass if only it is new or modified
  if (!user.isModified("password")) return next();

  try {
    //has pass genration
    const salt = await bcrypt.genSalt(10);

    //hash password
    const hashedPass = await bcrypt.hash(user.password, salt);

    //override plain password with hased pass
    user.password = hashedPass;
    next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //use bcrypt to compare the provided password with hased password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

// Create User model
const User = mongoose.model("User", userSchema);
module.exports = User;
