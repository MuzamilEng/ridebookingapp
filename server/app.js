require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connection = require("./db/connection");
const stripe = require("stripe")(
  "sk_test_51PQFreRvJI1ePtmLx8JKaxotxvudFiwNgTg08KQEOwlfAeEd8eTdetDLqUmIQyoFaGkYrbRFBxhrDO77uPxdVXdq00muMh7tnE"
);
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const globalErrorHandler = require("./midddelware/error");
const userRoute = require("./route/userRoute");

app.use(express.json());
app.use(cors("*"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

connection();

app.use("/api/v1", userRoute);

app.post("/payment-sheet", async (req, res) => {
  const { currency, amount } = req.body;

  // Convert the amount to cents
  const amountInCents = parseFloat(amount) * 100;

  // Check if the amount is less than 50 cents
  if (amountInCents < 50) {
    return res.status(400).send({
      error: {
        message: "Amount must convert to at least 50 cents.",
      },
    });
  }

  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-04-10" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error("Stripe Error: ", error);

    // Handle specific Stripe errors
    if (error.type === "StripeCardError") {
      // A declined card error
      res.status(400).send({ error: { message: error.message } });
    } else if (error.type === "StripeInvalidRequestError") {
      // Invalid parameters were supplied to Stripe's API
      res.status(400).send({ error: { message: error.message } });
    } else if (error.type === "StripeAPIError") {
      // An error occurred internally with Stripe's API
      res
        .status(500)
        .send({
          error: {
            message: "An internal error occurred, please try again later.",
          },
        });
    } else if (error.type === "StripeConnectionError") {
      // Some kind of error occurred during the HTTPS communication
      res
        .status(500)
        .send({
          error: {
            message: "A network error occurred, please try again later.",
          },
        });
    } else if (error.type === "StripeAuthenticationError") {
      // You probably used an incorrect API key
      res
        .status(401)
        .send({
          error: { message: "Authentication with Stripe's API failed." },
        });
    } else {
      // Handle any other types of unexpected errors
      res
        .status(500)
        .send({
          error: {
            message: "An unknown error occurred, please try again later.",
          },
        });
    }
  }
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
