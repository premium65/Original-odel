import { connectMongo, getUsersCollection, isMongoConnected } from './mongoConnection.js';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    await connectMongo();
    
    if (!isMongoConnected()) {
      console.log('MongoDB not connected, cannot create admin user');
      return;
    }

    const collection = getUsersCollection();
    
    // Check if admin already exists
    const existingAdmin = await collection.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
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
      points: 0,
      createdAt: new Date()
    };

    const result = await collection.insertOne(adminUser);
    console.log('Admin user created successfully with ID:', result.insertedId);
    console.log('Login credentials: username=admin, password=admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
