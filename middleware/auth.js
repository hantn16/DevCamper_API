const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }
  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} not authorize to access this route`,
          403
        )
      );
    }
    next();
  };
};
