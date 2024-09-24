const User = require("../models/userModel");
const mongoose = require('mongoose');

exports.checkTrial = async (req, res, next) => {
    try {
        // Get the user ID from either the request body or the request parameters
        const userId = req.body.id || req.params.id;
        
        // Check if the user ID is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Validate if the user ID is in the correct format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Find the user in the database
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has a valid subscription or trial
        if (user.valid === 'valid' || user.subscription === 'active') {
            return next(); // Proceed to the next middleware if user is valid
        } else {
            return res.status(403).json({ message: 'Please get a subscription', user });
        }
    } catch (err) {
        console.error('Error in checkTrial:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
