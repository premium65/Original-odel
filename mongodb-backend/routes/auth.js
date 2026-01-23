const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, mobileNumber } = req.body;
    console.log('Incoming body:', req.body);

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      mobileNumber,
      status: 'pending',
      isAdmin: 0,
      destinationAmount: '25000.00',
      milestoneAmount: '0.00',
      milestoneReward: '0.00',
      totalAdsCompleted: 0,
      points: 100,
    });

    await user.save();
    console.log('User saved:', user._id);

    res.json({
      message: 'Registration successful. Please wait for admin approval.',
      userId: user._id,
      userCode: user._id.toString().slice(-8).toUpperCase(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Incoming body:', req.body);

    // Find by email or username
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username: email });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check status
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Account pending approval' });
    }
    if (user.status === 'frozen') {
      return res.status(403).json({ error: 'Account has been frozen' });
    }

    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;

    res.json({
      message: 'Login successful',
      userId: user._id,
      userCode: user._id.toString().slice(-8).toUpperCase(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
      status: user.status,
      isAdmin: user.isAdmin,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolderName: user.accountHolderName,
      branchName: user.branchName,
      destinationAmount: user.destinationAmount,
      milestoneAmount: user.milestoneAmount,
      milestoneReward: user.milestoneReward,
      totalAdsCompleted: user.totalAdsCompleted,
      restrictionAdsLimit: user.restrictionAdsLimit,
      restrictionDeposit: user.restrictionDeposit,
      restrictionCommission: user.restrictionCommission,
      ongoingMilestone: user.ongoingMilestone,
      restrictedAdsCompleted: user.restrictedAdsCompleted,
      points: user.points,
      registeredAt: user.registeredAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
