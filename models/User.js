const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Schema } = mongoose;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: 6,
    required: [true, 'Please add a password'],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpired: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password using bcryptjs
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// sign JWT Token and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Check if user entered password is matched
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash reset password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate resetToken
  const resetToken = crypto.randomBytes(20).toString('hex');
  // Hash token and set it to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set token expiration equals 10 min from now
  this.resetPasswordExpired = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model('User', userSchema);
