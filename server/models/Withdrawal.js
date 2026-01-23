import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending, approved, rejected
  
  // Bank Details
  bankFullName: String,
  bankAccountNumber: String,
  bankName: String,
  bankBranch: String,
  
  // Processing
  notes: String,
  processedBy: mongoose.Schema.Types.ObjectId,
  processedAt: Date,
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Withdrawal", withdrawalSchema);
