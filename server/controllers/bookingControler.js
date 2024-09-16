const Booking = require("../models/bookingModel");
const CustomError = require("../error/customClass");
const sendEmail = require("../utils/sendMail");

exports.createBooking = async (req, res, next) => {
  try {
    const { name, email, phone, address, startDate, endDate, itemDetail } = req.body;

    // Log input data for debugging
    console.log("create booking", name, email, phone, address, startDate, endDate, itemDetail);

    // Validate all required fields
    if (!name || !email || !phone || !address || !startDate || !endDate || !itemDetail) {
      throw new CustomError("All fields are required", 400);
    }

    // Validate item detail
    if (typeof itemDetail !== "object" || itemDetail === null) {
      throw new CustomError("Item detail must be an object", 400);
    }

    const { name: itemName, price: itemPrice } = itemDetail;
    if (!itemName || typeof itemName !== "string") {
      throw new CustomError("Item detail must include a valid name", 400);
    }

    const pricePerDay = parseFloat(itemPrice);
    if (isNaN(pricePerDay)) {
      throw new CustomError("Item price must be a valid number", 400);
    }

    // Validate and parse startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date();

    if (start < currentDate.setHours(0, 0, 0, 0)) {
      throw new CustomError("Start date cannot be in the past", 400);
    }

    if (end <= start) {
      throw new CustomError("End date must be after the start date", 400);
    }

    // Find conflicting bookings for the same item
    const conflictingBookings = await Booking.find({
      "itemDetail.name": itemName,
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (conflictingBookings.length > 0) {
      throw new CustomError(`Already booked for the selected dates`, 400);
    }

    // Calculate total price based on the number of days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = pricePerDay * days;

    // Create a new booking
    const newBooking = new Booking({
      name,
      email,
      phone,
      address,
      startDate: start,
      endDate: end,
      itemDetail: {
        name: itemName,
        price: pricePerDay,
      },
      total: totalPrice,
    });

    const savedBooking = await newBooking.save();

    // Send confirmation email
    await sendEmail(savedBooking);

    res.status(201).json({
      message: `Booking successful for ${itemName} from ${start.toDateString()} to ${end.toDateString()}`,
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};

async function sendBookingConfirmationEmail(booking) {
  const { email, name, phone, address, startDate, endDate, time, itemDetail, total, days } =
    booking;
  const subject = "Booking Confirmation";
  const text = "Your booking has been confirmed!";
  const html = `
    <b>Your booking details:</b><br>
    Name: ${name}<br>
    Email: ${email}<br>
    Phone: ${phone}<br>
    Address: ${address}<br>
    Start Date: ${startDate}<br>
    End Date: ${endDate}<br>
    Time: ${time || "N/A"}<br>
    Item: ${itemDetail.name}<br>
    Price per day: ${itemDetail.price}<br>
    Number of days: ${days}<br>
    Total Price: ${total}
  `;

  await sendEmail(email, subject, text, html);
}
exports.checkinAvailibility = async (req, res, next) => {
  try {
    const { itemName } = req.body;
    console.log(itemName, "itemName");
    // Find a single booking document
    const conflictingBookings = await Booking.findOne({
      "itemDetail.name": itemName,
    });
    console.log(conflictingBookings, "single booking");
    // If no booking is found, it means the item is available
    if (!conflictingBookings) {
      return next(new CustomError("Booking available", 404));
    }

    // Calculate the number of days for the booking
    const startDate = new Date(conflictingBookings.startDate);
    const endDate = new Date(conflictingBookings.endDate);
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      message: `Already booked for ${totalDays} days`,
    });
  } catch (err) {
    console.error("Error checking in availability:", err);
    next(err); // Pass the correct error object
  }
};
