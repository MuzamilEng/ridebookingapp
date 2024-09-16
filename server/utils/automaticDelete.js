const cron = require("node-cron");
const bookingModel = require("../models/bookingModel");

const startBookingCleanupJob = () => {
  // Run the job every 3, 6, 9, 12, 15, ..., 57 seconds past the minute
  const seconds = Array.from({ length: 20 }, (_, i) => i * 3);

  seconds.forEach((second) => {
    cron.schedule(`10 * * * * *`, async () => {
      console.log(`Cron job running at ${second} seconds past the minute...`);

      try {
        const now = new Date();
        console.log("Current time:", now);

        // Find bookings where endDate is before the current date
        const expiredBookings = await bookingModel.find({
          endDate: { $lte: now },
        });

        console.log("Expired bookings found:", expiredBookings);

        if (expiredBookings.length > 0) {
          // Delete expired bookings
          await bookingModel.deleteMany({
            _id: { $in: expiredBookings.map((booking) => booking._id) },
          });
          console.log(`Deleted ${expiredBookings.length} expired bookings`);
        } else {
          console.log("No expired bookings to delete");
        }
      } catch (err) {
        console.error("Error deleting expired bookings:", err);
      }
    });
  });

  console.log("Booking cleanup jobs scheduled to run every 3 seconds");
};

module.exports = startBookingCleanupJob;
