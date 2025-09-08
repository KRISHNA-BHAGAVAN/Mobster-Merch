// routes/paymentMode.js
import express from "express";
import { redisClient } from "../config/redis.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get current payment mode
router.get("/", async (req, res) => {
  try {
    const mode = await redisClient.get("payment_mode");
    res.json({ payment_mode: mode || "manual" }); // default = manual
  } catch (err) {
    console.error("Error fetching payment mode:", err);
    res.status(500).json({ message: "Error fetching payment mode" });
  }
});

// Set payment mode (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { mode } = req.body;
    if (!["manual", "phonepe"].includes(mode)) {
      return res.status(400).json({ message: "Invalid mode. Use 'manual' or 'phonepe'" });
    }

    await redisClient.set("payment_mode", mode);
    res.json({ message: `Payment mode updated to ${mode}` });
  } catch (err) {
    console.error("Error updating payment mode:", err);
    res.status(500).json({ message: "Error updating payment mode" });
  }
});

export default router;
