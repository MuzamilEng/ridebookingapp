const User = require("../models/userModel");
const AppError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const crypto = require('crypto');
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, userType, long, lat, number } = req.body;

    // Check if required fields are provided
    if (!name || !email || !userType || !password || !number) {
      console.log(req.body);
      return next(new AppError("Please fill out all fields", 400));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }
    // Set the trial period (7 days)
    const startTrial = new Date(); // current date
    const endTrial = new Date(startTrial.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds

    // Create the user with the trial dates
    const user = await User.create({
      name,
      email,
      password,
      userType,
      startTrial,
      endTrial,
      long,
      lat,
      phoneNumber: number,
    });

    // Send the response back
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


exports.getAllUser = async (req, res, next) => {
  try {
    const { userType } = req.body;
    console.log(userType, "user type");
    // Validate userType
    if (!userType) {
      return res.status(400).json({
        status: "fail",
        message: "userType is required",
      });
    }

    const lowerCaseUserType = userType.toLocaleLowerCase();

    // Define the opposite userType
    let oppositeUserType;
    if (lowerCaseUserType === "user") {
      oppositeUserType = "rider";
    } else if (lowerCaseUserType === "rider") {
      oppositeUserType = "user";
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Invalid userType provided",
      });
    }

    // Fetch users based on the opposite userType
    const users = await User.find({ userType: oppositeUserType });

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

exports.getUserLocation = async (req, res, next) => {
  try {
    const { id, long, lat } = req.body;
    console.log(id, "user id h wod oqwjdoqwjdqw", long, lat);

    if (id) {
      // Use findOne() instead of find() to get a single document
      const user = await User.findOne({ _id: id });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Update user's long and lat
      user.long = long;
      user.lat = lat;

      // Save the updated user document
      await user.save();

      // console.log(user, "user");
      res.status(200).json({
        status: "success",
        data: user,
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "User ID not provided",
      });
    }
  } catch (err) {
    console.error(err);
    return next(new AppError(err.message, 500));
  }
};
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password, "eeee ppp");
    console.log(req.body,'bbboooddy')
    if (!email || !password) {
      return next(new AppError("Please fill out all fields", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: "success",
      data: user,
      token,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

exports.toggleType = async (req, res) => {
  try {
    
    const id = req.params.id;
    console.log('abc')
    console.log(id,req.body, "user id type");
    const user = await User.findByIdAndUpdate(id, { userType: req.body.userType }, { new: true });
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try{
    const {status,id} = req.body;
    console.log(status,id,'status id');
    const user = await User.findById(id)
    if(!user){
      console.log(req.body,'body')
      return next(new AppError('User not found ssss',400))
    }
    user.status = status;
    await user.save();
    res.status(200).json({
      status:'success',
      data:user
    })
  }catch(err){
    console.log(err);
    return next(new AppError(err.message, 500));
  }
}


exports.subscription = async (req,res,next)=>{
  try{
    const {id} = req.body;
    const user = await User.findByIdAndUpdate(id, { subscription: 'active' }, { new: true });
    if(!user){
      return next(new AppError('User not found',400))
    }
    res.status(200).json({
      status:'success',
      data:user
    })
  }catch(err){
    console.log(err);
    return next(new AppError(err.message, 500));
  }
}






exports.jazzCash = async (req, res) => {
  const { amount, orderId } = req.body;

  console.log(amount, orderId, 'amount order'); // Debug log

  const merchantId = 'MC126132';
  const password = '5y9agyxswh';
  const integritySalt = 'z1x92f9y6e';

  // Prepare the payment request parameters
// Ensure to provide a valid mobile number if required by the JazzCash API
const paymentData = {
  pp_Version: '1.1',
  pp_TxnType: 'MWALLET',
  pp_Language: 'EN',
  pp_MerchantID: merchantId,
  pp_Password: password,
  pp_TxnRefNo: orderId, // Ensure this is valid and not empty
  pp_Amount: amount * 100, // Correctly converting to paisa
  pp_ReturnURL: 'http://localhost:9000/api/v1/verify-payment',
  pp_Description: 'Payment for Order',
  pp_Currency: 'PKR',
  pp_SecureHash: '', // Will be calculated
  pp_BillReference: orderId,
  pp_TxnCurrency: 'PKR',
};

// Generate the Secure Hash
const hashString = `${integritySalt}&${paymentData.pp_Amount}&${paymentData.pp_MerchantID}&${paymentData.pp_TxnRefNo}`;
paymentData.pp_SecureHash = crypto.createHash('sha256').update(hashString).digest('hex');

  // Send the payment request to JazzCash API
  try {
    const response = await axios.post(
      'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction',
      paymentData
    );
    res.json(response.data); // Return the response data to the client
  } catch (error) {
    console.error('Error initiating payment:', error.response ? error.response.data : error.message); // Log error details
    res.status(500).json({ error: 'Payment initiation failed' });
  }
};

// Verify Payment on Return URL
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      pp_TxnRefNo,
      pp_Amount,
      pp_TxnDateTime,
      pp_ResponseCode,
      pp_ResponseMessage,
      pp_SecureHash,
    } = req.body; // The payment response data will come here

    // Step 1: Recalculate the secure hash and validate
    const integritySalt = 'z1x92f9y6e';
    const calculatedHashString = `${integritySalt}&${pp_Amount}&MC126132&${pp_TxnRefNo}`;
    const calculatedHash = crypto.createHash('sha256').update(calculatedHashString).digest('hex');

    if (pp_SecureHash !== calculatedHash) {
      return res.status(400).json({ error: 'Invalid secure hash. Payment might be tampered with.' });
    }

    // Step 2: Handle the payment response and update the order status
    if (pp_ResponseCode === '000') {
      // Payment success
      res.json({ message: 'Payment successful', transactionId: pp_TxnRefNo });
    } else {
      // Payment failed
      res.status(400).json({ message: `Payment failed: ${pp_ResponseMessage}` });
    }
  } catch (err) {
    console.error('Error verifying payment:', err.message); // Log error details
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

exports.addPhone = async(req,res,next)=>{
  try{
    const {id,phoneNumber} = req.body
    console.log(req.body,'body')
    console.log(id,phoneNumber,'id phone');
    const user = await User.findById(id)
    if(!user){
      console.log('User not found')
      return next(new AppError('user notfound', 400));
    }
    if(user){
      user.phoneNumber = phoneNumber
      await user.save()
    }
    
    res.status(200).json({
      status:'success',
      data:user
    })
  }catch(err){
    console.log(err);
    return next(new AppError(err.message, 500));
  }
}