import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Hash a plain text password
export const hashPassword = async (password) => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return hashed;
};

// Compare plain text with hashed password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
