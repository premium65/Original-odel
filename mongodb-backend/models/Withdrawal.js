const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  
  // Bank details for withdrawal
  bankFullName: { type: String },
  bankAccountNumber: { type: String },
  bankName: { type: String },
  bankBranch: { type: String },
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
