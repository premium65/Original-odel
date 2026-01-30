import bcrypt from 'bcrypt';

// Hash the password "admin123"
async function hashPassword() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Hashed password for admin user:');
  console.log(hash);
}

hashPassword();
