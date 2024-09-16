const express = require("express");
const app = express();
const cors = require("cors");
const createBooking = require("./route/bookingRoute");
const userRoute = require("./route/userRoute");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || 'sk_test_51OvmpoEWhpY7ASOwvNgGtQQjqmdRh7122hFErJdTdZYe0wHbH76F2LMPAinNKrzUiUylrWcgmY2z8rTfg2PhYa0t00rUDiCsE2');

// Middleware
app.use(cors("*"));   
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", createBooking);
app.use("/api/v1", userRoute);

app.post('/payment-sheet', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Validate input
    if (!amount || !currency || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or currency' });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send the PaymentIntent client secret to the client
    res.json({
      paymentIntent: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

app.use(require("./error/errorMiddelware"));

module.exports = app;