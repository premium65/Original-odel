import db from "../db/connection.js";

// USER — Request a withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    await db.run(
      "INSERT INTO withdrawals (userId, amount, status) VALUES (?, ?, ?)",
      [userId, amount, "pending"]
    );

    res.json({ message: "Withdrawal request submitted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER — View own withdrawal history
export const getUserWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await db.all(
      "SELECT * FROM withdrawals WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN — View all withdrawals
export const adminGetWithdrawals = async (req, res) => {
  try {
    const results = await db.all(
      `SELECT w.id, w.userId, u.name AS userName, w.amount, w.status, w.createdAt
       FROM withdrawals w
       JOIN users u ON w.userId = u.id
       ORDER BY w.createdAt DESC`
    );

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN — Approve withdrawal
export const approveWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    await db.run(
      "UPDATE withdrawals SET status = 'approved' WHERE id = ?",
      [withdrawalId]
    );

    res.json({ message: "Withdrawal approved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN — Reject withdrawal
export const rejectWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    await db.run(
      "UPDATE withdrawals SET status = 'rejected' WHERE id = ?",
      [withdrawalId]
    );

    res.json({ message: "Withdrawal rejected" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
