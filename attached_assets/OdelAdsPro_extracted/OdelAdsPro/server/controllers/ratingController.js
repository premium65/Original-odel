import db from "../db/connection.js";

// USER — Rate an ad
export const rateAd = async (req, res) => {
  try {
    const { adId, rating } = req.body;
    const userId = req.user.id;

    if (!adId || !rating)
      return res.status(400).json({ message: "adId and rating required" });

    // Check if already rated
    const exists = await db.get(
      "SELECT * FROM ratings WHERE userId = ? AND adId = ?",
      [userId, adId]
    );

    if (exists)
      return res.status(400).json({ message: "You already rated this ad" });

    await db.run(
      "INSERT INTO ratings (userId, adId, rating) VALUES (?, ?, ?)",
      [userId, adId, rating]
    );

    res.json({ message: "Rating submitted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER — Get own ratings
export const getUserRatings = async (req, res) => {
  try {
    const ratings = await db.all(
      `SELECT r.id, r.rating, a.title AS adTitle, r.createdAt
       FROM ratings r
       JOIN ads a ON r.adId = a.id
       WHERE r.userId = ?
       ORDER BY r.createdAt DESC`,
      [req.user.id]
    );

    res.json(ratings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN — Get all ratings
export const adminGetRatings = async (req, res) => {
  try {
    const ratings = await db.all(
      `SELECT r.id, u.name AS userName, a.title AS adTitle, r.rating, r.createdAt
       FROM ratings r
       JOIN users u ON r.userId = u.id
       JOIN ads a ON r.adId = a.id
       ORDER BY r.createdAt DESC`
    );

    res.json(ratings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
