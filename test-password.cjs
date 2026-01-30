// Test password hash verification
const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = '$2b$10$XbI.EW4pa36D6gv2mpNhKeRKr/DBBEyb5YE4sFe20B/cIfsyoGmyW';

async function testPassword() {
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Valid:', isValid);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
