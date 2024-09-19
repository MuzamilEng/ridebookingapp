const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const {
  registerUser,
  getAllUser,
  getUserLocation,
  loginUser,
  toggleType,
  toggleStatus,
} = require("../controllers/register");
router.route("/registerUser").post(registerUser);
router.route("/getUsers").post(getAllUser);
router.route("/getUserLocation").post(getUserLocation);
router.route("/login").post(loginUser);
router.route("/toggleType/:id").put(toggleType);
router.route('/toggleStatus').put(toggleStatus);
module.exports = router;
