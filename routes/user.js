const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuth, hasRole } = require('../middleware/auth');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only) or self (vendor/customer)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users (or single user for non-admin)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 - $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
