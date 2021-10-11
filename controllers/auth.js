const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
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
// @desc    Get all users
// @route   GET /api/v1/auth
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
