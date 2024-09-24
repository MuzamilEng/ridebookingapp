const {  mongoose } = require("mongoose");

const connectioMethod = async () => {
  try {
    const connect = await mongoose.connect(process.env.URI);
    console.log("Connected successfully to MongoDB");
  } catch (err) {
    console.log(err.message, "connection failed");
  }
};

module.exports = connectioMethod;