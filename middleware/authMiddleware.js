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

            next();

        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }

    }

    if(!token){
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = {protect};