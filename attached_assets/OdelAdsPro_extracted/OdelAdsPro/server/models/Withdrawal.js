import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  
  // Bank details
  bankFullName: { type: String },
  bankAccountNumber: { type: String },
  bankName: { type: String },
  bankBranch: { type: String },
  
  // Processing info
  notes: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Withdrawal", withdrawalSchema);
