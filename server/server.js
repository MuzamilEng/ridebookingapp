require("dotenv").config();
const app = require("./app");
const startBookingCleanupJob = require("./utils/automaticDelete");
const dbConnection = require("./db/connection");
dbConnection();
startBookingCleanupJob();
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
