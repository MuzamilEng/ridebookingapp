const mongoose = require("mongoose");

// Item schema for item details in the booking
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

// Booking schema
const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },

    itemDetail: {
      type: itemSchema,
      required: true,
    },
    book: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
