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
  jazzCash,
  verifyPayment,
  addPhone,
} = require("../controllers/register");
const { checkTrial } = require("../midddelware/checkTrial");
router.route("/registerUser").post(registerUser);
router.route("/getUsers").post(getAllUser);
router.route("/getUserLocation").post(getUserLocation);
router.route("/login").post(loginUser);
router.route("/toggleType/:id").put(toggleType);
router.route('/toggleStatus').put(toggleStatus);
router.route('/subscription').put(subscription)
router.route('/jazzCash').post(jazzCash);
router.route('/verify-payment').post(verifyPayment)
router.route('/addPhone').post(addPhone);
module.exports = router;
