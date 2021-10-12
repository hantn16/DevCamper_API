const express = require('express');
const {
  register,
  login,
  getMe,
  getUsers,
  forgotPassword,
  resetPassword,
  updateUserDetails,
  updatePassword,
} = require('../controllers/auth');
const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/me/updatedetails').put(protect, updateUserDetails);
router.route('/me/updatepassword').put(protect, updatePassword);

router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').put(resetPassword);

module.exports = router;
