const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendMail');
const advancedResults = require('../middleware/advancedResults');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register an user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    role,
    password,
  });
  sendTokenResponse(user, 201, res);
});
// @desc    Login an user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide an email and a password', 400)
    );
  }
  const user = await User.findOne({ email }).select('+password');
  // Check if email exist
  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }
  // Check if password is matched
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const option = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }
  res
    .status(statusCode)
    .cookie('token', token, option)
    .json({ success: true, token });
};

// @desc    Get user logged in
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/me/updatedetails
// @access  Private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/me/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Invalid current password', 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorResponse('Please provide email address'));
  }
  const user = await User.findOne({ email: req.body.email });
  //Check if there is any user with specific email
  if (!user) {
    return next(
      new ErrorResponse(`There isn't any user with email: ${req.body.email}`)
    );
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are recieving this email because you (or someone else) has requested the reset of password. 
  Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      toEmail: user.email,
      subject: 'Reset Password',
      text: message,
    });
    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Error with send email', 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse('Invalid reset token'));
  }
  // Change password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
