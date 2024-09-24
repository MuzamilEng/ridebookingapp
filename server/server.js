require("dotenv").config();
const app = require("./app");
const {startBookingCleanupJob,checTrial }= require("./utils/automaticDelete");

const connectioMethod = require("./db/connection");
connectioMethod();
// startBookingCleanupJob();
checTrial()
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
