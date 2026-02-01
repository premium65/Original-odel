import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the user schema to match the existing one
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  mobileNumber: { type: String },
  status: { type: String, default: 'active' },
  isAdmin: { type: Number, default: 0 }, // 0 = user, 1 = admin
  destinationAmount: { type: Number, default: 25000 },
  milestoneAmount: { type: Number, default: 0 },
  milestoneReward: { type: Number, default: 0 },
  totalAdsCompleted: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/odeladspro');
    console.log('Connected to MongoDB successfully');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@gameSitePro.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      mobileNumber: '0000000000',
      status: 'active',
      isAdmin: 1,
      destinationAmount: 0,
      milestoneAmount: 0,
      milestoneReward: 0,
      totalAdsCompleted: 0,
      points: 0
    });

    const result = await adminUser.save();
    console.log('Admin user created successfully with ID:', result._id);
    console.log('Login credentials: username=admin, password=admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdminUser();
