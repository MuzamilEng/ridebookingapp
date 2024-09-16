const mongoose = require("mongoose");
const connectioMethod = async () => {
  try {
    const connect = await mongoose.connect(process.env.URI);
    console.log("connected successfully");
  } catch (err) {
    console.log(err.message, "connection fail");
  }
};
module.exports = connectioMethod;
