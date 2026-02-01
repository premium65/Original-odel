// Generate correct hash for "admin123"
import bcrypt from 'bcrypt';

const password = 'admin123';
const saltRounds = 10;

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Generated hash:', hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verification test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();
