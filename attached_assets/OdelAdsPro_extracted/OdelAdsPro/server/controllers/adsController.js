import db from "../db/connection.js";

// Get all ads (public / users)
export const getAds = async (req, res) => {
  try {
    const ads = await db.all("SELECT * FROM ads ORDER BY createdAt DESC");
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — Create ad
export const createAd = async (req, res) => {
  try {
    const { title, description, reward } = req.body;

    if (!title || !reward)
      return res.status(400).json({ message: "Title and reward required" });

    await db.run(
      "INSERT INTO ads (title, description, reward) VALUES (?, ?, ?)",
      [title, description, reward]
    );

    res.json({ message: "Ad created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — Update ad
export const updateAd = async (req, res) => {
  try {
    const { title, description, reward } = req.body;
    const adId = req.params.id;

    await db.run(
      "UPDATE ads SET title = ?, description = ?, reward = ? WHERE id = ?",
      [title, description, reward, adId]
    );

    res.json({ message: "Ad updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin — Delete ad
export const deleteAd = async (req, res) => {
  try {
    const adId = req.params.id;

    await db.run("DELETE FROM ads WHERE id = ?", [adId]);

    res.json({ message: "Ad deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
