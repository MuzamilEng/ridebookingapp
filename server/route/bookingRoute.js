const express = require("express");
const router = express.Router();
const { createBooking, checkinAvailibility } = require("../controllers/bookingControler");
router.route("/booking").post(createBooking);
router.route("/availability").post(checkinAvailibility);
module.exports = router;
