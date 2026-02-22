const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req , res , next) => {
    let token;

    // Check for the 'Authorization' header and if it starts with 'Bearer'
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the request header (it's the second part of 'Bearer <token>')
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our secret key
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decode.id).select('-password');

            if(!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!req.user.isVerified) {
                return res.status(403).json({
                    message: 'Please verify your email.'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized, token failed'
            });
        }

    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

module.exports = { protect };