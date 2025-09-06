import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Submit payment proof and create order
router.post('/submit-payment', authMiddleware, upload.single('screenshot'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { address, transaction_id } = req.body;
    const user_id = req.session.userId;
    const addressData = JSON.parse(address);
    
    if (!transaction_id || !req.file) {
      return res.status(400).json({ message: 'Transaction ID and screenshot are required' });
    }
    
    // Get cart items and create order
    const [cartItems] = await connection.execute(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart c JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ? AND p.is_deleted = 0`,
      [user_id]
    );
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    
    // Generate order ID
    const generateUniqueOrderId = async () => {
      let orderId;
      let exists = true;
      while (exists) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        orderId = '';
        for (let i = 0; i < 6; i++) {
          orderId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM orders WHERE order_id = ?', [orderId]);
        exists = existing[0].count > 0;
      }
      return orderId;
    };
    
    const order_id = await generateUniqueOrderId();
    
    // Save address
    await connection.execute(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE
       address_line1 = VALUES(address_line1), address_line2 = VALUES(address_line2),
       city = VALUES(city), state = VALUES(state), pincode = VALUES(pincode)`,
      [user_id, addressData.address_line1, addressData.address_line2 || '', addressData.city, addressData.state, addressData.pincode]
    );
    
    // Create order
    await connection.execute(
      'INSERT INTO orders (order_id, user_id, total, status) VALUES (?, ?, ?, ?)',
      [order_id, user_id, total, 'pending']
    );
    
    // Insert order items
    for (const item of cartItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }
    
    // Create payment verification
    await connection.execute(
      `INSERT INTO payment_verifications (order_id, user_id, transaction_id, screenshot_url, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, user_id, transaction_id, req.file.path, total, 'pending']
    );
    
    // Clear cart
    await connection.execute('DELETE FROM cart WHERE user_id = ?', [user_id]);
    
    await connection.commit();
    
    res.json({ 
      message: 'Order created and payment submitted for verification',
      order_id 
    });
    
  } catch (error) {
    console.error('Payment submission error:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error submitting payment' });
  } finally {
    connection.release();
  }
});

// Get pending payment verifications (Admin only)
router.get('/admin/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [verifications] = await pool.execute(`
      SELECT pv.*, o.total, u.name, u.email, u.phone
      FROM payment_verifications pv
      JOIN orders o ON pv.order_id = o.order_id
      JOIN users u ON pv.user_id = u.user_id
      WHERE pv.status = 'pending'
      ORDER BY pv.created_at DESC
    `);
    
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment verifications' });
  }
});

// Verify payment (Admin only)
router.post('/admin/verify/:verification_id', authMiddleware, adminMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { verification_id } = req.params;
    const { action, admin_notes } = req.body; // action: 'approve' or 'reject'
    
    // Get verification details
    const [verifications] = await connection.execute(`
      SELECT pv.*, o.user_id, u.name, u.email
      FROM payment_verifications pv
      JOIN orders o ON pv.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE pv.verification_id = ?
    `, [verification_id]);
    
    if (verifications.length === 0) {
      return res.status(404).json({ message: 'Payment verification not found' });
    }
    
    const verification = verifications[0];
    
    if (action === 'approve') {
      // Update verification status
      await connection.execute(
        'UPDATE payment_verifications SET status = ?, admin_notes = ?, verified_at = NOW() WHERE verification_id = ?',
        ['approved', admin_notes || '', verification_id]
      );
      
      // Update order status to paid
      await connection.execute(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['paid', verification.order_id]
      );
      
      // Reduce product stock
      const [orderItems] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [verification.order_id]
      );
      
      for (const item of orderItems) {
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      // Send notification to customer
      await connection.execute(`
        INSERT INTO notifications (type, title, message, order_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'order_update',
        'Payment Verified - Order Confirmed',
        `Your payment for order #${verification.order_id} has been verified and confirmed. Your order is now being processed.`,
        verification.order_id,
        verification.user_id
      ]);
      
    } else if (action === 'reject') {
      // Update verification status
      await connection.execute(
        'UPDATE payment_verifications SET status = ?, admin_notes = ?, verified_at = NOW() WHERE verification_id = ?',
        ['rejected', admin_notes || '', verification_id]
      );
      
      // Send notification to customer
      await connection.execute(`
        INSERT INTO notifications (type, title, message, order_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'order_update',
        'Payment Verification Failed',
        `Your payment verification for order #${verification.order_id} was rejected. Reason: ${admin_notes || 'Invalid payment proof'}. Please contact support or submit valid payment proof.`,
        verification.order_id,
        verification.user_id
      ]);
    }
    
    await connection.commit();
    
    res.json({ 
      message: `Payment verification ${action}d successfully`,
      order_id: verification.order_id 
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error processing payment verification' });
  } finally {
    connection.release();
  }
});

// Get payment verification status for user
router.get('/status/:order_id', authMiddleware, async (req, res) => {
  try {
    const [verifications] = await pool.execute(`
      SELECT pv.status, pv.admin_notes, pv.created_at, pv.verified_at, o.status as order_status
      FROM payment_verifications pv
      JOIN orders o ON pv.order_id = o.order_id
      WHERE pv.order_id = ? AND pv.user_id = ?
    `, [req.params.order_id, req.session.userId]);
    
    if (verifications.length === 0) {
      return res.status(404).json({ message: 'Payment verification not found' });
    }
    
    res.json(verifications[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment verification status' });
  }
});

export default router;