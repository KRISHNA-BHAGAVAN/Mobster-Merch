import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Confirm payment (user-triggered)
router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { order_id, transaction_ref } = req.body;
    
    // Verify order belongs to user
    const [orders] = await pool.execute(
      'SELECT order_id FROM orders WHERE order_id = ? AND user_id = ?',
      [order_id, req.session.userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update payment with transaction reference
    await pool.execute(
      'UPDATE payments SET transaction_ref = ? WHERE order_id = ?',
      [transaction_ref || null, order_id]
    );
    
    res.json({ 
      message: 'Payment confirmation received',
      status: 'awaiting_verification' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

// Admin: Mark payment as complete
router.post('/:payment_id/mark-complete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payment_id = req.params.payment_id;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get order_id from payment
      const [payments] = await connection.execute(
        'SELECT order_id FROM payments WHERE payment_id = ?',
        [payment_id]
      );
      
      if (payments.length === 0) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      const order_id = payments[0].order_id;
      
      // Update payment status
      await connection.execute(
        'UPDATE payments SET status = ?, paid_at = NOW() WHERE payment_id = ?',
        ['completed', payment_id]
      );
      
      // Update order status to paid
      await connection.execute(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['paid', order_id]
      );
      
      // Update stock (reduce quantities)
      const [orderItems] = await connection.execute(`
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = ?
      `, [order_id]);
      
      for (const item of orderItems) {
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }
      
      await connection.commit();
      
      res.json({ 
        message: 'Payment marked as completed',
        order_id: order_id
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking payment as complete' });
  }
});

// Admin: Get pending payments
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT p.payment_id, p.order_id, p.amount, p.transaction_ref, p.status,
             o.user_id, u.name as user_name, o.created_at
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE p.status = 'pending'
      ORDER BY o.created_at DESC
    `);
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending payments' });
  }
});

export default router;