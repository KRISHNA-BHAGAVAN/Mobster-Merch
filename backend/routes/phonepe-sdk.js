// backend/routes/phonepe-sdk.js
import express from 'express';
import dotenv from 'dotenv';
import pool from '../config/database.js';
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
  CreateSdkOrderRequest
} from 'pg-sdk-node';
import { authMiddleware } from '../middleware/auth.js';

dotenv.config({ override: true });

const router = express.Router();

// 1. Initialize PhonePe SDK
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION);
const env = process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;

const phonePeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

// Utility: ensure order exists
async function ensureOrder(orderId, userId, amount) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
  if (rows.length === 0) {
    await pool.query(
      'INSERT INTO orders (order_id, user_id, total, status, payment_status) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId, amount, 'pending', 'pending']
    );
  }
}

// 2. Initiate Payment
router.post('/initiate-payment', authMiddleware, async (req, res) => {
  const { orderId, amount } = req.body;
  const userId = req.session.userId;
  if (!orderId || !amount || amount <= 0 || !userId) {
    return res.status(400).json({ error: 'Invalid orderId, amount or userId' });
  }

  const merchantOrderId = orderId;
  const amountPaisa = Math.round(amount * 100);
  const redirectUrl = "http://localhost:5173/payment-success";

  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaisa)
    .redirectUrl(redirectUrl)
    .build();

  try {
    await ensureOrder(merchantOrderId, userId, amount);
    
    // Store order ID in session for success page
    req.session.currentOrderId = merchantOrderId;
    
    const response = await phonePeClient.pay(request);

    await pool.query(
      `INSERT INTO payments (order_id, user_id, amount, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status)`,
      [merchantOrderId, userId, amount, 'pending']
    );

    res.json({
      checkoutUrl: response.redirectUrl,
      phonepeOrderId: response.order_id,
      state: response.state
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment initiation failed', details: err.message });
  }
});

// 3. Create SDK Order
router.post('/create-sdk-order', authMiddleware, async (req, res) => {
  const { orderId, amount, userId } = req.body;
  if (!orderId || !amount || amount <= 0 || !userId) {
    return res.status(400).json({ error: 'Invalid orderId, amount or userId' });
  }

  const merchantOrderId = orderId;
  const amountPaisa = Math.round(amount * 100);
  const redirectUrl = process.env.MERCHANT_REDIRECT_URL;

  const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaisa)
    .redirectUrl(redirectUrl)
    .build();

  try {
    await ensureOrder(merchantOrderId, userId, amount);
    const response = await phonePeClient.createSdkOrder(request);

    await pool.query(
      `INSERT INTO payments (order_id, user_id, amount, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount), status = VALUES(status)`,
      [merchantOrderId, userId, amount, 'pending']
    );

    res.json({
      sdkToken: response.token,
      phonepeOrderId: response.order_id,
      state: response.state
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'SDK Order creation failed', details: err.message });
  }
});

// 4. Check Order Status
router.get('/order-status/:orderId', authMiddleware, async (req, res) => {
  const merchantOrderId = req.params.orderId;
  if (!merchantOrderId) return res.status(400).json({ error: 'Missing orderId' });

  try {
    const response = await phonePeClient.getOrderStatus(merchantOrderId);
    const orderState = response?.data?.state || 'PENDING';
    
    console.log(`Order Status Check - OrderId: ${merchantOrderId}, State: ${orderState}`);
    
    // Map PhonePe states to our enum values
    let dbStatus = 'pending';
    if (orderState === 'COMPLETED') dbStatus = 'success';
    else if (orderState === 'FAILED') dbStatus = 'failed';
    else if (orderState === 'PENDING') dbStatus = 'pending';

    console.log(`Updating database - OrderId: ${merchantOrderId}, Status: ${dbStatus}`);

    const paymentUpdate = await pool.query(
      'UPDATE payments SET status = ? WHERE order_id = ?',
      [dbStatus, merchantOrderId]
    );
    const orderUpdate = await pool.query(
      'UPDATE orders SET payment_status = ?, status = ? WHERE order_id = ?',
      [dbStatus, dbStatus === 'success' ? 'paid' : 'pending', merchantOrderId]
    );
    
    console.log(`Payment update affected rows: ${paymentUpdate[0].affectedRows}`);
    console.log(`Order update affected rows: ${orderUpdate[0].affectedRows}`);

    res.json({ orderStatus: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching order status', details: err.message });
  }
});

// 5. Refund Payment
router.post('/refund', authMiddleware, async (req, res) => {
  const { orderId, amount, refundId } = req.body;
  if (!orderId || !amount || amount <= 0 || !refundId) {
    return res.status(400).json({ error: 'Invalid orderId, refundId or amount' });
  }

  try {
    const amountPaisa = Math.round(amount * 100);

    // Fetch payment_id from payments table
    const [[payment]] = await pool.query(
      'SELECT payment_id FROM payments WHERE order_id = ?',
      [orderId]
    );

    if (!payment || !payment.payment_id) {
      return res.status(400).json({ error: 'No payment found for this orderId' });
    }

    const paymentId = payment.payment_id;

    // Insert refund record (pending)
    await pool.query(
      `INSERT INTO refunds (refund_id, payment_id, order_id, amount, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [refundId, paymentId, orderId, amount]
    );

    // Call PhonePe Refund API
    const response = await phonePeClient.refund(refundId, orderId, amountPaisa);

    const refundState = response?.data?.state?.toLowerCase() || 'pending';
    const phonepeRefundTxnId = response?.data?.transactionId || null;

    // Update refunds table
    await pool.query(
      `UPDATE refunds
       SET status = ?, phonepe_refund_txn_id = ?, callback_data = ?
       WHERE refund_id = ?`,
      [refundState, phonepeRefundTxnId, JSON.stringify(response), refundId]
    );

    // Update payments table with refund_id
    await pool.query(
      'UPDATE payments SET refund_id = ? WHERE payment_id = ?',
      [refundId, paymentId]
    );

    // If full refund, mark payment and order as refunded
    if (refundState === 'success') {
      const [[{ total }]] = await pool.query(
        'SELECT total FROM orders WHERE order_id = ?',
        [orderId]
      );

      if (Number(amount) >= Number(total)) {
        await pool.query('UPDATE payments SET status = ? WHERE payment_id = ?', ['refunded', paymentId]);
        await pool.query('UPDATE orders SET payment_status = ? WHERE order_id = ?', ['refunded', orderId]);
      }
    }

    res.json({ refundStatus: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Refund failed', details: err.message });
  }
});

// 6. Webhook Callback (payments + refunds)
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const payload = req.body;
    const orderId = payload?.merchantOrderId;
    const txnId = payload?.transactionId;
    const refundId = payload?.refundId;
    const state = payload?.state?.toLowerCase() || 'unknown';

    if (refundId) {
      await pool.query(
        `UPDATE refunds 
         SET status = ?, phonepe_refund_txn_id = ?, callback_data = ?
         WHERE refund_id = ?`,
        [state, txnId, JSON.stringify(payload), refundId]
      );
    } else if (orderId) {
      await pool.query(
        `UPDATE payments 
         SET status = ?, phonepe_txn_id = ?, callback_data = ?
         WHERE order_id = ?`,
        [state, txnId, JSON.stringify(payload), orderId]
      );
      await pool.query('UPDATE orders SET payment_status = ? WHERE order_id = ?', [state, orderId]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handling failed', details: err.message });
  }
});

// Get current order ID from session
router.get('/current-order', authMiddleware, async (req, res) => {
  const orderId = req.session.currentOrderId;
  if (!orderId) {
    return res.status(404).json({ error: 'No current order found' });
  }
  res.json({ orderId });
});

export default router;
