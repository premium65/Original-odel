import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odeladspro';

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String },
  status: { type: String, default: 'pending' }, // pending, active, frozen
  registeredAt: { type: Date, default: Date.now },
  isAdmin: { type: Number, default: 0 }, // 0 = regular user, 1 = admin
  // Bank details
  bankName: { type: String },
  accountNumber: { type: String },
  accountHolderName: { type: String },
  branchName: { type: String },
  // Financial tracking
  destinationAmount: { type: String, default: '25000.00' },
  milestoneAmount: { type: String, default: '0.00' },
  milestoneReward: { type: String, default: '0.00' },
  totalAdsCompleted: { type: Number, default: 0 },
  // Restriction fields
  restrictionAdsLimit: { type: Number },
  restrictionDeposit: { type: String },
  restrictionCommission: { type: String },
  ongoingMilestone: { type: String, default: '0.00' },
  restrictedAdsCompleted: { type: Number, default: 0 },
  points: { type: Number, default: 100 },
});

// Ad Schema
const adSchema = new mongoose.Schema({
  adCode: { type: String, required: true, unique: true },
  duration: { type: Number, default: 10 },
  price: { type: String, default: '101.75' },
  link: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Ad Click Schema
const adClickSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad', required: true },
  clickedAt: { type: Date, default: Date.now },
});

// Rating Schema
const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUsername: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Withdrawal Schema
const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: String, required: true },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
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

// Session Schema for express-session
const sessionSchema = new mongoose.Schema({
  _id: String,
  session: Object,
  expires: Date,
});

export const User = mongoose.model('User', userSchema);
export const Ad = mongoose.model('Ad', adSchema);
export const AdClick = mongoose.model('AdClick', adClickSchema);
export const Rating = mongoose.model('Rating', ratingSchema);
export const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export const Session = mongoose.model('Session', sessionSchema);

export default mongoose;
