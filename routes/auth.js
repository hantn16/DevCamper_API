const express = require('express');
const { register, login, getMe, getUsers } = require('../controllers/auth');
const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
router.route('/').get(advancedResults(User), getUsers);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);

module.exports = router;
