import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String },
  
  // Account Status
  isApproved: { type: Boolean, default: false },
  isFrozen: { type: Boolean, default: false },
  isAdmin: { type: Number, default: 0 }, // 0 = user, 1 = admin
  
  // Bank Details
  bankName: String,
  accountNumber: String,
  accountHolderName: String,
  branchName: String,
  
  // Financial Tracking
  destinationAmount: { type: Number, default: 25000 }, // First-day bonus
  milestoneAmount: { type: Number, default: 0 }, // Withdrawable balance
  milestoneReward: { type: Number, default: 0 }, // Total lifetime earnings
  
  // Ad Tracking
  adsClicked: { type: Number, default: 0 },
  lastAdClick: Date,
  
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
