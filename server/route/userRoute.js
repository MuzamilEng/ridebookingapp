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
  subscription,
} = require("../controllers/register");
const { checkTrial } = require("../midddelware/checkTrial");
router.route("/registerUser").post(registerUser);
router.route("/getUsers").post(getAllUser);
router.route("/getUserLocation").post(getUserLocation);
router.route("/login").post(loginUser);
router.route("/toggleType/:id").put(checkTrial,toggleType);
router.route('/toggleStatus').put(checkTrial,toggleStatus);
router.route('/subscription').put(subscription)
module.exports = router;
