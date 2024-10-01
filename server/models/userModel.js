const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email uniqueness
    },
    phoneNumber:{
      type: String,
      required: true,
      // unique: true, // Ensure phone number uniqueness
    },
    userType: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
    startTrial: {
      type: String,
      // required: true,
    },
    endTrial: {
      type: String,
      // required: true,
    },
    valid:{
      type:String,
      default:'valid'
    },
    subscription:{
      type: String,
      default:'inactive'
    },
    status:{
      type: String,
     default:'online'
    }
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
