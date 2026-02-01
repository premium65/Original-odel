require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const adsRoutes = require('./routes/ads');
const ratingsRoutes = require('./routes/ratings');
const withdrawalsRoutes = require('./routes/withdrawals');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/odeladspro')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
