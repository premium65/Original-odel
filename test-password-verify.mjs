// Test password verification
import bcrypt from 'bcrypt';

const testPasswords = [
  'admin123',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '$2b$10$XbI.EW4pa36D6gv2mpNhKeRKr/DBBEyb5YE4sFe20B/cIfsyoGmyW'
];

const hashes = [
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '$2b$10$XbI.EW4pa36D6gv2mpNhKeRKr/DBBEyb5YE4sFe20B/cIfsyoGmyW'
];

async function testPasswordVerification() {
  console.log('Testing password verification...\n');
  
  for (const hash of hashes) {
    console.log(`Testing hash: ${hash.substring(0, 20)}...`);
    
    for (const password of testPasswords) {
      try {
        const isValid = await bcrypt.compare(password, hash);
        console.log(`  Password "${password}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      } catch (error) {
        console.log(`  Password "${password}": ❌ ERROR - ${error.message}`);
      }
    }
    console.log('');
  }
}

testPasswordVerification();
