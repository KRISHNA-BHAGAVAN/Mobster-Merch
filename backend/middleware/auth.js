import { redisClient } from "../config/redis.js";
import db from "../config/database.js";

export const authMiddleware = async (req, res, next) => {
  // Case 1: Session is already active
  if (req.session.userId) {
    return next();
  }

  // Case 2: No active session, check for refreshToken
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized: No session or refresh token" });
  }

  try {
    const userId = await redisClient.get(`refresh_${refreshToken}`);
    if (!userId) {
      // Invalid or expired refresh token
      return res.status(401).json({ error: "Unauthorized: Invalid or expired refresh token" });
    }

    // Re-create the session using the valid refresh token
    req.session.userId = userId;

    // Optional: Fetch isAdmin status to set on the session
    const [userRows] = await db.query(
      "SELECT is_admin FROM users WHERE user_id = ?",
      [userId]
    );
    if (userRows.length > 0) {
      req.session.isAdmin = Boolean(userRows[0].is_admin);
    } else {
      req.session.isAdmin = false;
    }

    console.log(`✅ Session re-established for userId: ${userId}`);

    // Call next to proceed with the request
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
