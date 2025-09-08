import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get payment method setting
router.get('/payment-method', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['payment_method']
    );
    
    const paymentMethod = rows.length > 0 ? rows[0].setting_value : 'manual';
    res.json({ method: paymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment method' });
  }
});

// Update payment method setting
router.put('/payment-method', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { method } = req.body;
    
    if (!['manual', 'phonepe'].includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    await pool.execute(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      ['payment_method', method]
    );
    
    res.json({ message: 'Payment method updated successfully', method });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment method' });
  }
});

export default router;