import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/database.js";
import { redisClient } from "../config/redis.js";
import { siteClosedMiddleware } from "../middleware/site-status.js";

const router = express.Router();

// Session / refresh token TTL in seconds
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

// ---------------------
// Helper: Generate random token
// ---------------------
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Shared cookie config
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    path: "/"
  };
}

// ---------------------
// Register
// ---------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, is_admin } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, phone, and password are required" });
    }

    // Check for existing user
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ? OR phone = ? OR name = ?",
      [email, phone, name]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Email, phone, or username already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, phone, is_admin ? 1 : 0]
    );

    const userId = result.insertId;

    // Create session
    req.session.userId = userId;
    req.session.isAdmin = is_admin ? true : false;

    // Create refresh token
    const refreshToken = generateToken();
    await redisClient.set(`refresh_${refreshToken}`, userId, "EX", REFRESH_TTL);

    res.cookie("refreshToken", refreshToken, cookieOptions());

    console.log("✅ User registration successful:", name);

    res.json({
      success: true,
      user: { id: userId, name, email, phone, isAdmin: Boolean(is_admin) },
      isAdmin: Boolean(is_admin),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ---------------------
// Login
// ---------------------
router.post("/login",  async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "Email/username and password are required" });
    }

    const closed = await redisClient.get('site_closed');
    
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR name = ?",
      [identifier, identifier]
    );
    
    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    
    // Create session
    req.session.userId = user.user_id;
    req.session.isAdmin = Boolean(user.is_admin);

    // Create refresh token
    const refreshToken = generateToken();
    await redisClient.set(
      `refresh_${refreshToken}`,
      user.user_id,
      "EX",
      REFRESH_TTL
    );

    res.cookie("refreshToken", refreshToken, cookieOptions());
    
    if (closed === '1' && !user.is_admin) {
      return res.json({ message: "Site is under maintainance" });
    }

    res.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image_url: user.image_url || null,
        isAdmin: Boolean(user.is_admin),
      },
      isAdmin: Boolean(user.is_admin),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------------
// Refresh Token
// ---------------------
// This route is now mostly redundant but can be kept as a fallback or for specific refresh logic.
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token provided" });

    const userId = await redisClient.get(`refresh_${refreshToken}`);
    if (!userId)
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });

    // Re-create session
    req.session.userId = userId;

    const [userRows] = await db.query(
      "SELECT is_admin FROM users WHERE user_id = ?",
      [userId]
    );
    req.session.isAdmin = userRows.length > 0 ? Boolean(userRows[0].is_admin) : false;

    // Generate a new refresh token
    const newToken = generateToken();

    // Atomically delete old token & set new one
    await redisClient
      .multi()
      .del(`refresh_${refreshToken}`)
      .set(`refresh_${newToken}`, userId, "EX", REFRESH_TTL)
      .exec();

    res.cookie("refreshToken", newToken, cookieOptions());

    res.json({ success: true });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Could not refresh session" });
  }
});

// ---------------------
// Check Auth Status (no middleware required)
// ---------------------
router.get("/status", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.json({ isAuthenticated: false });
    }

    const [rows] = await db.query(
      "SELECT user_id, name, email, phone, image_url, is_admin FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.json({ isAuthenticated: false });
    }

    const user = rows[0];
    res.json({
      isAuthenticated: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image_url: user.image_url || null,
        isAdmin: Boolean(user.is_admin),
      },
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    res.json({ isAuthenticated: false });
  }
});

// ---------------------
// Get Current User
// ---------------------
router.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [rows] = await db.query(
      "SELECT user_id, name, email, phone, image_url, is_admin FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows.length) return res.status(401).json({ error: "User not found" });

    const user = rows[0];
    res.json({
      user_id: user.user_id,
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: user.image_url || null,
      isAdmin: Boolean(user.is_admin),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// Logout
// ---------------------
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await redisClient.del(`refresh_${refreshToken}`);
    }

    // Explicitly clear both cookies
    res.clearCookie("sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    });
    res.clearCookie("refreshToken", cookieOptions());

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      return res.json({ success: true, message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
