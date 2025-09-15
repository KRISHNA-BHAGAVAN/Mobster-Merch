import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/database.js";
import { redisClient } from "../config/redis.js";
import { siteClosedMiddleware } from "../middleware/site-status.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

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
// Register (Email Verification)
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

    // Generate verification token
    const verificationToken = generateToken();

    // Store user data temporarily in Redis (1 hour expiry)
    const userData = {
      name,
      email,
      password: hash,
      phone,
      is_admin: is_admin ? 1 : 0
    };
    await redisClient.set(`verify_${verificationToken}`, JSON.stringify(userData), "EX", 3600);

    // Send verification email
    const { sendVerificationEmail } = await import("../utils/verificationEmailService.js");
    try {
      await sendVerificationEmail(email, name, verificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      await redisClient.del(`verify_${verificationToken}`);
      return res.status(500).json({ error: "Failed to send verification email. Please try again." });
    }

    res.json({
      success: true,
      message: "Registration initiated. Please check your email to verify your account."
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
    
    if (rows.length<=0)
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
// Check Verification Status
// ---------------------
router.get("/check-verification", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const [rows] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    res.json({ verified: rows.length > 0 });
  } catch (error) {
    console.error("Verification check error:", error);
    res.status(500).json({ error: "Failed to check verification status" });
  }
});

// ---------------------
// Verify Email
// ---------------------
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Get user data from Redis
    const userDataStr = await redisClient.get(`verify_${token}`);
    if (!userDataStr) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    const userData = JSON.parse(userDataStr);

    // Create user in MySQL
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)",
      [userData.name, userData.email, userData.password, userData.phone, userData.is_admin]
    );

    const userId = result.insertId;

    // Delete verification token
    await redisClient.del(`verify_${token}`);

    console.log("✅ Email verified and user created:", userData.name);

    res.json({
      success: true,
      message: "Email verified successfully! You can now login."
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Email verification failed" });
  }
});

// ---------------------
// Password Reset - Step 1: Check User and Send Code
// ---------------------
router.post("/reset-password-request", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Username or email is required" });
    }

    // Check if user exists
    const [rows] = await db.query(
      "SELECT user_id, name, email FROM users WHERE email = ? OR name = ?",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: "User not found", 
        shouldRegister: true 
      });
    }

    const user = rows[0];
    
    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in Redis (15 minutes expiry)
    await redisClient.set(`reset_code_${user.user_id}`, resetCode, "EX", 900);
    
    // Send email with code
    const { sendPasswordResetCodeEmail } = await import("../utils/passwordResetEmailService.js");
    await sendPasswordResetCodeEmail(user.email, user.name, resetCode);
    
    res.json({
      success: true,
      message: "Reset code sent to your email",
      userId: user.user_id
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to send reset code" });
  }
});

// ---------------------
// Password Reset - Step 2: Verify Code
// ---------------------
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: "User ID and code are required" });
    }

    // Get stored code from Redis
    const storedCode = await redisClient.get(`reset_code_${userId}`);
    
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    // Generate verification token for password reset
    const verifyToken = generateToken();
    await redisClient.set(`reset_verify_${verifyToken}`, userId, "EX", 900);
    
    // Delete the code as it's been used
    await redisClient.del(`reset_code_${userId}`);
    
    res.json({
      success: true,
      message: "Code verified successfully",
      verifyToken
    });
  } catch (error) {
    console.error("Code verification error:", error);
    res.status(500).json({ error: "Code verification failed" });
  }
});

// ---------------------
// Password Reset - Step 3: Set New Password
// ---------------------
router.post("/reset-password-complete", async (req, res) => {
  try {
    const { verifyToken, newPassword, confirmPassword } = req.body;

    if (!verifyToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Get user ID from verification token
    const userId = await redisClient.get(`reset_verify_${verifyToken}`);
    
    if (!userId) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    await db.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashedPassword, userId]
    );
    
    // Delete verification token
    await redisClient.del(`reset_verify_${verifyToken}`);
    
    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Password reset completion error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

// ---------------------
// Legacy endpoint (keeping for compatibility)
// ---------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Check if user exists by username and get email
    const [rows] = await db.query(
      "SELECT user_id, name, email FROM users WHERE name = ?",
      [username]
    );

    if (!rows.length) {
      // Don't reveal if username exists or not for security
      return res.json({ success: true, message: "If the username exists, a reset token has been sent to the registered email." });
    }

    const user = rows[0];
    
    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset token in Redis with 15 minutes expiry using username as key
    await redisClient.set(`reset_${username}`, resetToken, "EX", 900);
    
    // Send email with reset token
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log(`Reset token sent to ${user.email} for username: ${username}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete the token if email fails
      await redisClient.del(`reset_${username}`);
      return res.status(500).json({ error: "Failed to send reset email. Please check email configuration." });
    }
    
    res.json({ 
      success: true, 
      message: "If the username exists, a reset token has been sent to the registered email address."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// ---------------------
// Reset Password with Token
// ---------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { username, token, password, confirmPassword } = req.body;

    if (!username || !token || !password || !confirmPassword) {
      return res.status(400).json({ error: "Username, token, password, and confirm password are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Verify reset token
    const storedToken = await redisClient.get(`reset_${username}`);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Update password
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE name = ?",
      [hash, username]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // Delete the reset token
    await redisClient.del(`reset_${username}`);

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
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
