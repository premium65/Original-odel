import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    await db.insert(users).values({
      username,
      email,
      full_name,
      password: hashed,
      status: "pending"
    });

    res.json({ message: "Registration successful. Wait for admin approval." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.select().from(users).where(eq(users.email, email))[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    };

    res.json({
      message: "Login success",
      user: req.session.user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
