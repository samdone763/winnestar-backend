const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) return res.status(401).json({ success: false, message: 'Unauthorized.' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { protect, generateToken };
