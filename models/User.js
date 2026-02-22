const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema (
    {
        username: {
            type: String,
            required:[true, 'Please enter username'],
            unique: true,
            trim: true,

        },
        email: {
            type:String,
            required:[true, 'Please add an email'],
            unique: true,
            lowercase: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please use a valid email address',
            ]
        },
        password: {
            type: String,
            required: [true, 'Please enter password'],
            minLength: [8,'Password must be at least 8 characters'],

        },
        // for email verification
        isVerified: {
            type: Boolean,
            default: false
        },

        verificationToken: String,
        verificationTokenExpire: Date,

        // reset password
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// A pre-save hook to hash the password before saving
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare the provided password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword , this.password);
    
};

const User = mongoose.model('User', UserSchema);
module.exports = User;