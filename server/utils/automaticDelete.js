const cron = require("node-cron");
const bookingModel = require("../models/bookingModel");
const User = require("../models/userModel");

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

const checTrial = () => {
  cron.schedule('10 * * * * *', async () => {
    try {
      // Get the current date
      const today = new Date();

      // Find users whose trial period has expired
      const expiredUsers = await User.find({
        endTrial: { $lte: today },  
        valid: 'valid',             
      });

      if (expiredUsers.length > 0) {
        // Update the 'valid' field to 'not valid' for these users
        await User.updateMany(
          { _id: { $in: expiredUsers.map((user) => user._id) } },
          { $set: { valid: 'not valid' } }
        );
        console.log(`Updated ${expiredUsers.length} users to 'not valid'`);
      } else {
        console.log('No users found with expired trial periods');
      }
    } catch (err) {
      console.error('Error updating users:', err);
    }
  });
};

module.exports = { startBookingCleanupJob, checTrial };
