const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── LOGGING ──
app.use(morgan('combined'));

// ── BODY PARSING ──
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── RATE LIMITING ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use(globalLimiter);

// ── MONGODB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── HEALTH CHECK ──
app.get('/', (req, res) => res.json({ success: true, message: '👗 Winnestar Fashion API is live!', version: '1.0.0' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() }));

// ── ROUTES ──
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// ── 404 ──
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`👗 Winnestar Backend running on port ${PORT}`);
});

module.exports = app;
