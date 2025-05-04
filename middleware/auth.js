const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token is Missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.hasRole = role => (req, res, next) => {
  if (req.user.role !== role && req.user.role !== 'admin') {
    return res.status(403).json({ message: `${req.user.role} Not Authorize for this action` });
  }
  next();
};