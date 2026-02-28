
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { protect, generateToken } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required.' });
    const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+password');
    if (!admin || !admin.isActive) return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    const token = generateToken(admin._id);
    res.json({ success: true, token, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/verify', protect, (req, res) => {
  res.json({ success: true, admin: { id: req.admin._id, username: req.admin.username, role: req.admin.role } });
});

router.get('/setup', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.SETUP_SECRET) return res.status(403).json({ success: false, message: 'Forbidden.' });
    const USERNAME = process.env.ADMIN_USERNAME;
    const PASSWORD = process.env.ADMIN_PASSWORD;
    if (!USERNAME || !PASSWORD) return res.status(400).json({ success: false, message: 'ADMIN_USERNAME and ADMIN_PASSWORD env variables not set.' });
    const existing = await Admin.findOne({ username: USERNAME.toLowerCase() });
    if (existing) return res.json({ success: true, message: 'Admin already exists!', username: existing.username });
    const admin = new Admin({ username: USERNAME.toLowerCase(), password: PASSWORD, role: 'superadmin', isActive: true });
    await admin.save();
    res.json({ success: true, message: '✅ Admin created! Remove SETUP_SECRET from env now.', username: USERNAME });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
