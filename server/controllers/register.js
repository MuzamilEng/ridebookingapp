const User = require("../models/userModel");
const AppError = require("../utils/customError");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, userType ,long,lat} = req.body;

    // Check if required fields are provided
    if (!name || !email || !userType || !password) {
      console.log(req.body);
      return next(new AppError("Please fill out all fields", 400));
    }
    console.log(name, email, password,long,lat, 'hybrid');

    // Set the trial period (1 minute)
const startTrial = new Date(); // current date     
    
const endTrial = new Date(startTrial.getTime() + 30 * 60 * 1000); // 30 

    // Create the user with the trial dates
    const user = await User.create({
      name,
      email,
      password,
      userType,
      startTrial,
      endTrial,
      long,
      lat
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
    // console.log(status,id,'status id');
    const user = await User.findById(id)
    if(!user){
      return next(new AppError('User not found',400))
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