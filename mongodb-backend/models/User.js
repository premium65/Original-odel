const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'active', 'frozen'] },
  registeredAt: { type: Date, default: Date.now },
  isAdmin: { type: Number, default: 0 }, // 0 = regular user, 1 = admin
  
  // Bank details
  bankName: { type: String },
  accountNumber: { type: String },
  accountHolderName: { type: String },
  branchName: { type: String },
  
  // Financial tracking
  destinationAmount: { type: String, default: '25000.00' }, // First-day bonus
  milestoneAmount: { type: String, default: '0.00' }, // Withdrawable balance
  milestoneReward: { type: String, default: '0.00' }, // Total earnings
  totalAdsCompleted: { type: Number, default: 0 },
  
  // Restriction fields
  restrictionAdsLimit: { type: Number },
  restrictionDeposit: { type: String },
  restrictionCommission: { type: String },
  ongoingMilestone: { type: String, default: '0.00' },
  restrictedAdsCompleted: { type: Number, default: 0 },
  
  // Points
  points: { type: Number, default: 100, max: 100 },
});

module.exports = mongoose.model('User', userSchema);
