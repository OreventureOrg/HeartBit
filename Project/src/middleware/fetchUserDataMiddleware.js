// src/middleware/fetchUserDataMiddleware.js
const User = require('../models/User');

const fetchUserDataMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).send('User not authenticated');
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        req.userBalance = user.balance || 0;
        req.username = user.username || '';
        req.earnedToday = user.earnedToday || 0;
        req.earnedTotal = user.earnedTotal || 0;
        req.actionsDoneToday = user.actionsDoneToday || 0;
        req.actionsDoneTotal = user.actionsDoneTotal || 0;

        next();
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = fetchUserDataMiddleware;
