import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY_ODEL_ADS");
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
