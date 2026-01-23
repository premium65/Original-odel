import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/connection.js";

// JWT SECRET
const JWT_SECRET = "SUPER_SECRET_KEY_CHANGE_THIS";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Check if user exists
    const existing = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = bcrypt.hashSync(password, 10);

    await db.run(
      "INSERT INTO users (name, email, password, isApproved) VALUES (?, ?, ?, ?)",
      [name, email, hashed, 0]
    );

    res.json({ message: "Registered successfully, wait for admin approval." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!bcrypt.compareSync(password, user.password))
      return res.status(400).json({ message: "Invalid password" });

    if (user.isApproved === 0)
      return res.status(403).json({ message: "Account not approved yet" });

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
