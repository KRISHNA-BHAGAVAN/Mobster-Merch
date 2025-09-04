import express from "express";
import fs from "fs";
import path from "path";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import db from "../config/database.js";

const router = express.Router();
const settingsFile = path.join(process.cwd(), "settings.json");

// Get website status
router.get("/status", async (req, res) => {
  try {
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
      res.json({
        isOpen: settings.isOpen !== undefined ? settings.isOpen : true,
      });
    } else {
      res.json({ isOpen: true });
    }
  } catch (error) {
    res.json({ isOpen: true });
  }
});

// Toggle website status (admin only)
router.post("/toggle", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isOpen } = req.body;
    const settings = { isOpen };

    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

    res.json({
      message: `Website ${isOpen ? "opened" : "closed"} successfully`,
      isOpen,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating website status" });
  }
});

// Save email for maintenance notifications
router.post("/notify-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    await db.execute("INSERT IGNORE INTO notify_emails (email) VALUES (?)", [
      email,
    ]);

    res.json({
      message:
        "Email saved successfully! We'll notify you when the site is back online.",
    });
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).json({ message: "Error saving email" });
  }
});

// Get notify emails (admin only)
router.get(
  "/notify-emails",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [rows] = await db.execute(
        "SELECT email, created_at FROM notify_emails ORDER BY created_at DESC"
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching notify emails:", error);
      res.status(500).json({ message: "Error fetching emails" });
    }
  }
);

// Get analytics (admin only)
router.get("/analytics", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [userCount] = await db.execute("SELECT COUNT(*) as count FROM users");
    const [recentUsers] = await db.execute(
      "SELECT name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10"
    );
    
    res.json({
      userCount: userCount[0].count,
      recentUsers
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

// Notify all users when site opens (admin only)
router.post("/notify-all-users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.execute("SELECT user_id FROM users");
    
    for (const user of users) {
      await db.execute(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)",
        [user.user_id, 'admin_message', 'Website is Now Open!', 'Great news! Our website is now fully operational. You can browse products and place orders. Thank you for your patience!']
      );
    }
    
    res.json({ message: `Notifications sent to ${users.length} users` });
  } catch (error) {
    console.error("Error notifying users:", error);
    res.status(500).json({ message: "Error sending notifications" });
  }
});

export default router;
