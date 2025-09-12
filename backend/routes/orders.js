import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate unique 6-character alphanumeric order ID
const generateUniqueOrderId = async (connection) => {
  let orderId;
  let exists = true;
  
  while (exists) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    orderId = '';
    for (let i = 0; i < 6; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if this order_id already exists
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM orders WHERE order_id = ?',
      [orderId]
    );
    exists = existing[0].count > 0;
  }
  
  return orderId;
};

// Create pending order (before payment)
router.post('/', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const user_id = req.session.userId;
    
    // Get cart items
    const [cartItems] = await connection.execute(`
      SELECT c.product_id, c.quantity, p.price, p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `, [user_id]);
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ID ${item.product_id}` 
        });
      }
    }
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Generate unique alphanumeric order ID
    const order_id = await generateUniqueOrderId(connection);
    
    // Create order with alphanumeric ID
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
    
    // Get payment method setting
    const [paymentSettings] = await connection.execute(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['payment_method']
    );
    const paymentMethod = paymentSettings.length > 0 ? paymentSettings[0].setting_value : 'manual';
    
    // Don't create payment record here for PhonePe - will be created after redirect
    // Only create for manual payment method
    if (paymentMethod === 'manual') {
      const [paymentResult] = await connection.execute(
        'SELECT COALESCE(MAX(payment_id), 0) + 1 as next_id FROM payments'
      );
      const payment_id = paymentResult[0].next_id;
      
      await connection.execute(
        'INSERT INTO payments (payment_id, order_id, user_id, amount, method, status) VALUES (?, ?, ?, ?, ?, ?)',
        [payment_id, order_id, user_id, total, 'upi', 'pending']
      );
    }
    
    // Clear cart
    await connection.execute('DELETE FROM cart WHERE user_id = ?', [user_id]);
    
    await connection.commit();
    
    if (paymentMethod === 'phonepe') {
      res.status(201).json({ 
        message: 'Order created successfully', 
        order_id,
        total,
        payment_method: 'phonepe'
      });
    } else {
      // Generate UPI link for manual payment
      const upiLink = `upi://pay?pa=ogmerch@upi&pn=OG Merchandise&am=${total}&cu=INR&tn=Order${order_id}`;
      res.status(201).json({ 
        message: 'Order created successfully', 
        order_id,
        total,
        upi_link: upiLink,
        payment_method: 'manual'
      });
    }
    
  } catch (error) {
    console.error('Order creation error:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error creating order', error: error.message });
  } finally {
    connection.release();
  }
});

// Get order status by order_id
router.get('/:order_id/status', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT order_id, status FROM orders WHERE order_id = ? AND user_id = ?',
      [req.params.order_id, req.session.userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ 
      status: orders[0].status,
      order_id: orders[0].order_id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order status' });
  }
});

// Get single order details
router.get('/:order_id/details', authMiddleware, async (req, res) => {
  try {
    const [orderDetails] = await pool.execute(`
      SELECT o.*, u.name, u.email, u.phone,
             a.address_line1, a.address_line2, a.city, a.state, a.pincode,
             pv.transaction_id, pv.screenshot_url, pv.status as payment_status, pv.admin_notes
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN addresses a ON u.user_id = a.user_id AND a.is_default = 1
      LEFT JOIN payment_verifications pv ON o.order_id = pv.order_id
      WHERE o.order_id = ?
    `, [req.params.order_id]);
    
    // const [orderDetails] = await pool.execute(`
    //   SELECT o.*, u.name, u.email, u.phone,
    //          pv.transaction_id, pv.screenshot_url, pv.status as payment_status, pv.admin_notes
    //   FROM orders o
    //   JOIN users u ON o.user_id = u.user_id
    //   LEFT JOIN payment_verifications pv ON o.order_id = pv.order_id
    //   WHERE o.order_id = ?
    // `, [req.params.order_id]);
    
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const [orderItems] = await pool.execute(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [req.params.order_id]);

    console.log(`ORDER ADDRESS DETAILS: ${orderDetails}`)
    
    res.json({
      order: orderDetails[0],
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

// Get user orders
router.get('/user/:user_id', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.order_id, o.total, o.status, o.created_at,
             oi.product_id, oi.quantity, oi.price,
             p.name, p.image_url,
             pv.status as payment_status
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN payment_verifications pv ON o.order_id = pv.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.params.user_id]);
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status (admin only)
router.put('/:order_id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { status } = req.body;
    const order_id = req.params.order_id;
    
    // Get current order status
    const [currentOrder] = await connection.execute(
      'SELECT status FROM orders WHERE order_id = ?',
      [order_id]
    );
    
    if (currentOrder.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const oldStatus = currentOrder[0].status;
    
    // Update order status
    await connection.execute(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, order_id]
    );
    
    // Reduce stock if order status changed to paid/shipped/delivered
    if (['paid', 'shipped', 'delivered'].includes(status) && !['paid', 'shipped', 'delivered'].includes(oldStatus)) {
      const [orderItems] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [order_id]
      );
      
      for (const item of orderItems) {
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?',
          [item.quantity, item.product_id, item.quantity]
        );
      }
      
      console.log(`✅ Stock reduced for order ${order_id}`);
    }
    
    await connection.commit();
    res.json({ message: 'Order status updated and stock adjusted' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  } finally {
    connection.release();
  }
});

// Get all orders for admin with filters
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.order_id, o.user_id, o.total, o.status, o.created_at,
             u.name as user_name, u.email,
             GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY o.order_id ORDER BY o.created_at DESC';
    
    const [orders] = await pool.execute(query, params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get pending payments for admin
router.get('/admin/payments/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT p.payment_id, p.order_id, p.amount, p.status, p.created_at,
             p.transaction_ref, o.user_id, u.name as user_name
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at DESC
    `);
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending payments' });
  }
});

// Comprehensive analytics report
router.get('/admin/reports/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Total revenue and orders
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value
      FROM orders
    `);
    
    // Orders by status
    const [statusStats] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      GROUP BY status
    `);
    
    // Payment verification stats
    const [paymentStats] = await pool.execute(`
      SELECT 
        pv.status,
        COUNT(*) as count
      FROM payment_verifications pv
      GROUP BY pv.status
    `);
    
    // Daily sales (last 30 days)
    const [dailySales] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Top products
    const [topProducts] = await pool.execute(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status IN ('paid', 'shipped', 'delivered')
      GROUP BY p.product_id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    
    res.json({
      totalStats: totalStats[0],
      statusStats,
      paymentStats,
      dailySales,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Request order cancellation
router.post('/:order_id/cancel-request', authMiddleware, async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const user_id = req.session.userId;
    
    // Get user and order details
    const [orderDetails] = await pool.execute(`
      SELECT o.order_id, o.total, o.status, u.name, u.email, p.status as payment_status
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      WHERE o.order_id = ? AND o.user_id = ?
    `, [order_id, user_id]);
    
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orderDetails[0];
    
    // Check if order can be cancelled
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    
    // Create notification for admin
    await pool.execute(`
      INSERT INTO notifications (type, title, message, order_id, user_id)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'cancellation_request',
      'Order Cancellation Request',
      `Customer ${order.name} (${order.email}) has requested to cancel order #${order_id} worth ₹${order.total}. Payment Status: ${order.payment_status || 'pending'}`,
      order_id,
      user_id
    ]);
    
    res.json({ message: 'Cancellation request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting cancellation request' });
  }
});

// Request refund
router.post('/:order_id/refund-request', authMiddleware, async (req, res) => {
  try {
    const order_id = req.params.order_id;
    const user_id = req.session.userId;
    
    // Get user and order details
    const [orderDetails] = await pool.execute(`
      SELECT o.order_id, o.total, u.name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ? AND o.user_id = ?
    `, [order_id, user_id]);
    
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orderDetails[0];
    
    // Create notification for admin
    await pool.execute(`
      INSERT INTO notifications (type, title, message, order_id, user_id)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'refund_request',
      'Refund Request',
      `Customer ${order.name} (${order.email}) has requested a refund for order #${order_id} worth ₹${order.total}`,
      order_id,
      user_id
    ]);
    
    res.json({ message: 'Refund request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting refund request' });
  }
});

// Get notifications (admin only)
router.get('/admin/notifications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT notification_id, type, title, message, order_id, user_id, is_read, created_at
      FROM notifications
      ORDER BY created_at DESC
    `);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read (admin only)
router.put('/admin/notifications/:notification_id/read', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
      [req.params.notification_id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Send message to customer (admin only)
router.post('/admin/send-message', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { user_id, title, message } = req.body;
    
    await pool.execute(`
      INSERT INTO notifications (type, title, message, user_id)
      VALUES (?, ?, ?, ?)
    `, ['admin_message', title, message, user_id]);
    
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get customer notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT notification_id, type, title, message, order_id, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.session.userId]);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark customer notification as read
router.put('/notifications/:notification_id/read', authMiddleware, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [req.params.notification_id, req.session.userId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Get all users (admin only)
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT user_id, name, email, phone, created_at
      FROM users
      ORDER BY name ASC
    `);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Admin approve/decline cancellation
router.post('/admin/cancellation/:notification_id/:action', authMiddleware, adminMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { notification_id, action } = req.params; // action: 'approve' or 'decline'
    
    // Get notification details
    const [notifications] = await connection.execute(`
      SELECT n.order_id, n.user_id, u.name, u.email
      FROM notifications n
      JOIN users u ON n.user_id = u.user_id
      WHERE n.notification_id = ? AND n.type = 'cancellation_request'
    `, [notification_id]);
    
    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Cancellation request not found' });
    }
    
    const { order_id, user_id, name, email } = notifications[0];
    
    if (action === 'approve') {
      // Cancel the order
      await connection.execute('UPDATE orders SET status = ? WHERE order_id = ?', ['cancelled', order_id]);
      
      // Send approval message to customer
      await connection.execute(`
        INSERT INTO notifications (type, title, message, order_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'admin_message',
        'Order Cancellation Approved',
        `Your cancellation request for order #${order_id} has been approved. The order has been cancelled successfully.`,
        order_id,
        user_id
      ]);
    } else if (action === 'decline') {
      // Send decline message to customer
      await connection.execute(`
        INSERT INTO notifications (type, title, message, order_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'admin_message',
        'Order Cancellation Declined',
        `Your cancellation request for order #${order_id} has been declined. The order will continue to be processed.`,
        order_id,
        user_id
      ]);
    }
    
    // Mark the original notification as read
    await connection.execute(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
      [notification_id]
    );
    
    await connection.commit();
    
    res.json({ message: `Cancellation request ${action}d successfully` });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error processing cancellation request' });
  } finally {
    connection.release();
  }
});

// Daily sales report (legacy endpoint)
router.get('/admin/reports/daily', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [dailySales] = await pool.execute(`
      SELECT DATE(o.created_at) as date, 
             COUNT(*) as total_orders,
             SUM(o.total) as total_revenue
      FROM orders o
      WHERE o.status IN ('paid', 'shipped', 'delivered')
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    const [failedPayments] = await pool.execute(`
      SELECT COUNT(*) as failed_count
      FROM payment_verifications
      WHERE status = 'rejected'
    `);
    
    res.json({
      dailySales,
      failedPaymentsCount: failedPayments[0].failed_count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

export default router;