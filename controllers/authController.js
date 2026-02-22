const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const mailer = require('../config/mailer');
const asyncHandler = require('../utils/asyncHandler');
const {generateResetToken, hashToken} = require('../utils/tokenHelper')

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => { 
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        res.status(400);
        throw new Error("Please provide username, email and password");
    }
            
    let userExists = await User.findOne({ email });
        
    if(userExists) {
        res.status(409);
        throw new Error("User with this email already exists");
    }
        
    userExists = await User.findOne({username});
    if(userExists) {
        res.status(409);
        throw new Error("Username already taken")
    }

    const verificationToken = generateResetToken();

    const user = await User.create({ 
        username,
        email,
        password,
        verificationToken: hashToken(verificationToken),
        verificationTokenExpire: Date.now() + 86400000 // 24 hours
    });


    // sending verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&&email=${email}`;

    const emailData = {
        to: user.email,
        from: process.env.EMAIL_SENDER,
        subject: 'Verify your email Address',
        html: `
        <h2>Welcome ${username}!</h2>
        <p>Thank you for registrating. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you did not create this account, please ignore this email.</p>
        `
    };

    await mailer.send(emailData);

    res.status(201).json({
        success: true,
        message: 'Registration successfull. Please check your email to verify your account.',
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified
        }
    });

});

//@desc     Verify Email
//@route    GET /api/v1/auth/verify-email
//@access   Public
const verifyEmail = asyncHandler( async(req, res) => {
    const {token, email} = req.query;

    if (!token || !email) {
        res.status(400);
        throw new Error("Token and Email are reqired.");
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
        email: email,
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if(!user) {
        res.status(400);
        throw new Error("Invalid or Expired verification token");
    }

    // mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now log in.',
        data: {
            token: generateToken(user._id)
        }
    });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

const loginUser = asyncHandler( async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password) {
        res.status(400);
        throw new Error("Please provide username and password");
    }

    const user = await User.findOne({username});

    if(!user || !(await user.matchPassword(password))){
        res.status(401);
        throw new Error("Invalid credentials");
    }

    if(!user.isVerified) {
        res.status(403);
        throw new Error("Please verify your email before logging in");
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
            token: generateToken(user._id)
        }
    });
});

// @desc    Send password reset email
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if(!email) {
        res.status(400);
        throw new Error("Email is required");
    }

    const user = await User.findOne({ email });

    if (user) {
        const resetToken = generateResetToken();
        user.resetPasswordToken = hashToken(resetToken);
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
            
        const emailData = {
            to: user.email,
            from: process.env.EMAIL_SENDER,
            subject: 'Password Reset Request',
            html: `
              <h2>You have requested a password reset</h2>
              <p>Please click on the following link, or paste it into your browser to complete the process:</p>
              <a href="${resetUrl}">${resetUrl}</a>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request this, please ignore this email.</p>
            `
        };
        //Send the email
        await mailer.send(emailData);
    }

    res.status(200).json({
        success: true,
        message: 'If account with that email exists, a reset link has been sent.',
    });
    
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { password, resetToken, userEmail } = req.body;

    if (!password || !resetToken || !userEmail) {
        res.status(400);
        throw new Error("Missing required fields")
    }
        
    const hashedToken = hashToken(resetToken);
    
    const user = await User.findOne({
        email: userEmail,
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
        
    if (!user) {
        res.status(400);
        throw new Error("Invalid or expired token");
    }

    user.password = password; //The pre-save hook will handle hashing
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful' 
    });

});

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword,
};
