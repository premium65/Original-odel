import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  userCode: { type: String, required: true },
  password: { type: String, required: true },

  // Account Status
  isApproved: { type: Boolean, default: false },  
  isFrozen: { type: Boolean, default: false },

  // Earnings System
  destinationAmount: { type: Number, default: 25000 }, // first-time bonus
  milestoneAmount: { type: Number, default: 0 },       // withdrawable
  milestoneReward: { type: Number, default: 0 },       // lifetime earnings

  // Ads System
  adsClicked: { type: Number, default: 0 },
  lastAdClick: { type: Date, default: null },

  // Timestamps
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
