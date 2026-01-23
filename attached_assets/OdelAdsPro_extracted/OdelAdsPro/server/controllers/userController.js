import db from "../db/connection.js";

// ADMIN — Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.all(
      "SELECT id, name, email, isApproved, isFrozen, isAdmin, createdAt FROM users"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER — Get own profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await db.get(
      "SELECT id, name, email, isApproved, isFrozen, isAdmin FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN — Approve / Freeze user
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // approve | freeze
    const userId = req.params.id;

    if (!["approve", "freeze"].includes(status))
      return res.status(400).json({ message: "Invalid status type" });

    let query =
      status === "approve"
        ? "UPDATE users SET isApproved = 1 WHERE id = ?"
        : "UPDATE users SET isFrozen = 1 WHERE id = ?";

    await db.run(query, [userId]);

    res.json({
      message: status === "approve"
        ? "User approved successfully."
        : "User account frozen."
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
