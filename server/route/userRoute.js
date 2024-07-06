const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const {
  registerUser,
  getAllUser,
  getUserLocation,
  loginUser,
} = require("../controller/register");
router.route("/registerUser").post(registerUser);
router.route("/getUsers").post(getAllUser);
router.route("/getUserLocation").post(getUserLocation);
router.route("/login").post(loginUser);
module.exports = router;
