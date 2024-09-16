const express = require("express");
const app = express();
const cors = require("cors");
const createBooking = require("./route/bookingRoute");
const userRoute = require("./route/userRoute");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY|| 'sk_test_51OvmpoEWhpY7ASOwvNgGtQQjqmdRh7122hFErJdTdZYe0wHbH76F2LMPAinNKrzUiUylrWcgmY2z8rTfg2PhYa0t00rUDiCsE2');
// Middleware
app.use(cors("*")); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/v1", createBooking);

// Error handler
app.use("/api/v1", userRoute);
app.post('/payment-sheet', async (req, res) => {
  try {
    const { amount } = req.body; // Amount in pence (e.g., 950 for £9.50)

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).send('Invalid amount');
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd', // Currency in GBP
          product_data: {
            name: 'Service Payment',
          },
          unit_amount: amount, // Amount in pence
        },
        quantity: 1,
      }],
      mode: 'payment',
      // success_url: `http://localhost:5173/`,
      // cancel_url: `http://localhost:5173/`,
    });

    // Respond with the sessionId
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});
app.use(require("./error/errorMiddelware"));

module.exports = app;
