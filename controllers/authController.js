const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const options = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY,
    },
};

const mailer = nodemailer.createTransport(sgTransport(options));

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => { 
    console.log('Register request received:', req.body);
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message: 'Please enter a username and password'});
    }
    
    try {
        console.log('Checking if user exists...');
        
        let userExists = await User.findOne({ email });
        
        if(userExists) {
            return res.status(409).json({message: 'A user with that email already exists.'});
        }
        
        userExists = await User.findOne({username});
        if(userExists) {
            return res.status(409).json({ message: 'That username is already taken.' });
        }

        console.log('Creating new user...');
        const user = await User.create({ username,email, password});

        if(user){
            return res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data'});
        }
        
    } catch (error) {
        console.error('Server error during registration:', error);
        return res.status(500).json({ message: 'Server error'})
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({username});
        console.log('Comparing passwords:', user.username, 'and', password);
        if(user && (await user.matchPassword(password))){
            return res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),

            });

        } else {
            return res.status(401).json({ message: 'Invalid credentials'});

        }
    } catch (error) {
        console.error('Server error during login:', error);
        return res.status(500).json({ message: 'Server error'})
    }
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user) {
            // Generate a reset token
            const resetToken = crypto.randomBytes(20).toString('hex');

            user.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            
            user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

            await user.save({ validateBeforeSave: false });

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
            
            const emailData = {
                to: user.email,
                from: process.env.SENDER,
                subject: 'Password Reset Request',
                html: `
                  <h2>You have requested a password reset</h2>
                  <p>Please click on the following link, or paste it into your browser to complete the process:</p>
                  <a href="${resetUrl}">${resetUrl}</a>
                  <p>This link will expire in 1 hour.</p>
                  <p>If you did not request this, please ignore this email.</p>
                `,

            };

            //Send the email
            await mailer.sendMail(emailData);
        }
        return res.status(200).json({
            success: true,
            message: 'If account with that email exists, a reset link has been sent.',
        });

    } catch (error) {
        console.error("Forgot Password Controller Error:", error);
        return res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a reset link has been sent.',
        });
    }
};
const resetPassword = async (req, res) => {
    const { password, resetToken, userEmail } = req.body;

    if (!password || !resetToken || !userEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        console.log('Received token:', resetToken);
        console.log('Received email:', userEmail);
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        console.log('Hashed Token:', hashedToken);

        const user = await User.findOne({
            email: userEmail,
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        console.log('User found:', user);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password and save
        user.password = password; //The pre-save hook will handle hashing
        // user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Generating JWT
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET , {
        expiresIn: '30d'
    });
};


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};
