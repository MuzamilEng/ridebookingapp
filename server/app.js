const express = require("express");
const app = express();
const cors = require("cors");
const createBooking = require("./route/bookingRoute");
const userRoute = require("./route/userRoute");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || 'sk_test_51OvmpoEWhpY7ASOwvNgGtQQjqmdRh7122hFErJdTdZYe0wHbH76F2LMPAinNKrzUiUylrWcgmY2z8rTfg2PhYa0t00rUDiCsE2');
const Jazzcash = require('jazzcash-checkout');
const { default: axios } = require("axios");
const crypto = require('crypto');
// Middleware
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", createBooking);
app.use("/api/v1", userRoute);

// Stripe Payment Intent Route
app.post('/payment-sheet', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    if (!amount || !currency || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount or currency' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// JazzCash Payment Route

// JazzCash configuration
// Replace with your actual values
const MERCHANT_ID = 'MC126160';
const SECRET_KEY = 'fh91220he7';
const JAZZCASH_API_URL = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction';

// Generate a secure hash
function generateSecureHash(payload, secretKey) {
    const sortedKeys = Object.keys(payload).sort();
    let stringToHash = '';

    sortedKeys.forEach((key) => {
        stringToHash += key + '=' + payload[key] + '&';
    });

    // Remove the last '&'
    stringToHash = stringToHash.slice(0, -1);

    // Append the secret key to the string
    stringToHash += secretKey;

    // Generate SHA256 hash
    return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

// Handle JazzCash payment initiation




app.post('/jazzcash', (req, res) => {
  const { amount, txnRefNo,mobileNumber } = req.body;

  // Function to format date and time
  const formatDateTime = () => {
      const date = new Date();
      return date.toISOString().slice(0, 19).replace('T', ' '); // Example: "2024-09-25 10:08:54"
  };

  // Create payment data object
  const paymentData = {
      pp_Version: '1.1',
      pp_MerchantID: 'MC126160',
      pp_Password: '87h0su2wus',
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amount,
      pp_TxnCurrency: 'PKR',
      pp_Description: 'Payment Description',
      pp_Language: 'EN', // Language parameter
      pp_BillReference: 'BILL12345', // Add a valid bill reference here
      pp_TxnDateTime: formatDateTime().trim(),
      pp_MobileNumber: mobileNumber, // Ensure this is a valid mobile number if required
      pp_TxnType: 'Purchase', // Ensure correct transaction type
      // Add any other required parameters here
  };

  console.log('Payment Data:', paymentData); // Log the payment data for debugging

  // Make a request to JazzCash API
  axios.post('https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', paymentData)
      .then(response => {
          console.log('Response from JazzCash:', response.data); // Log the response
          res.json(response.data);
      })
      .catch(error => {
          console.error('Payment failed:', error.response ? error.response.data : error.message);
          res.status(500).json({ error: 'Payment failed' });
      });
});



// 404 Handler
app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

// Error Handling Middleware
app.use(require("./error/errorMiddelware"));

module.exports = app;
