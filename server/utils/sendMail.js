// Import nodemailer
const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "christop.lesch32@ethereal.email",
    pass: "hs86x1t4guy53wNfEe",
  },
});

// Create a sendEmail function
function sendEmail(to, subject, text, html, email) {
  // Define email options
  const mailOptions = {
    from: email, // Sender address
    to: to, // List of receiversa
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error occurred:", error.message);
    }
    console.log("Email sent:", info.response);
  });
}

// Export the function for use in other parts of your application
module.exports = sendEmail;
