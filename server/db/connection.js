const mongoose = require("mongoose");
const connection = async () => {
  try {
    const connect = await mongoose.connect(process.env.URI);
    console.log("Mongo db connect successfully");
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = connection;
