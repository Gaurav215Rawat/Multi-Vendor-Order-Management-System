const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuth, hasRole } = require('../middleware/auth');

// Get all users (admin) or self (customer/vendor)
router.get('/', isAuth, async (req, res) => {
  try {
    let users;

    if (req.user.role === 'admin') {
      users = await User.find().select('-password');
    } else {
      users = await User.findById(req.user._id).select('-password');
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

module.exports = router;
