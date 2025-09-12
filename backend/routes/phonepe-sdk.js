// backend/routes/phonepe-sdk.js
import express from "express";
import dotenv from "dotenv";
import pool from "../config/database.js";
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
  CreateSdkOrderRequest,
} from "pg-sdk-node";
import { authMiddleware } from "../middleware/auth.js";

dotenv.config({ override: true });
console.log("MERCHANT_REDIRECT_URL: ",process.env.MERCHANT_REDIRECT_URL)
const router = express.Router();

// 1. Initialize PhonePe SDK
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION);
const env =
  process.env.NODE_ENV === "production" ? Env.PRODUCTION : Env.SANDBOX;

const phonePeClient = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

// Utility: ensure order exists
async function ensureOrder(orderId, userId, amount) {
  const [rows] = await pool.query("SELECT * FROM orders WHERE order_id = ?", [
    orderId,
  ]);
  if (rows.length === 0) {
    await pool.query(
      "INSERT INTO orders (order_id, user_id, total, status, payment_status) VALUES (?, ?, ?, ?, ?)",
      [orderId, userId, amount, "pending", "pending"]
    );
  }
}

// 2. Initiate Payment
router.post("/initiate-payment", authMiddleware, async (req, res) => {
  const { orderId, amount } = req.body;
  const userId = req.session.userId;
  if (!orderId || !amount || amount <= 0 || !userId) {
    return res.status(400).json({ error: "Invalid orderId, amount or userId" });
  }

  const merchantOrderId = orderId;
  const amountPaisa = Math.round(amount * 100);
  const redirectUrl = `${process.env.MERCHANT_REDIRECT_URL}/payment-success`;

  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaisa)
    .redirectUrl(redirectUrl)
    .build();

  try {
    await ensureOrder(merchantOrderId, userId, amount);

    // Store order ID in session for success page
    req.session.currentOrderId = merchantOrderId;
    
    // Store address in session if provided in request
    if (req.body.address) {
      req.session.checkoutAddress = req.body.address;
    }

    const response = await phonePeClient.pay(request);

    // Don't create payment entry here - will be created after redirect

    res.json({
      checkoutUrl: response.redirectUrl,
      phonepeOrderId: response.order_id,
      state: response.state,
    });

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Payment initiation failed", details: err.message });
  }
});

// 3. Create SDK Order
router.post("/create-sdk-order", authMiddleware, async (req, res) => {
  const { orderId, amount, userId } = req.body;
  if (!orderId || !amount || amount <= 0 || !userId) {
    return res.status(400).json({ error: "Invalid orderId, amount or userId" });
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
      [merchantOrderId, userId, amount, "pending"]
    );

    res.json({
      sdkToken: response.token,
      phonepeOrderId: response.order_id,
      state: response.state,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SDK Order creation failed", details: err.message });
  }
});

// 4. Check Order Status
router.get("/order-status/:orderId", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  const merchantOrderId = req.params.orderId;
  if (!merchantOrderId)
    return res.status(400).json({ error: "Missing orderId" });

  try {
    await connection.beginTransaction();

    const response = await phonePeClient.getOrderStatus(merchantOrderId);
    const orderState = response?.state || "PENDING";
    console.log(req.session)
    const userId = req.session.userId;
    const transactionId = response?.paymentDetails?.[0]?.transactionId || null;

    console.log(
      `Order Status Check - OrderId: ${merchantOrderId}, State: ${orderState}`
    );

    // Map PhonePe states to our enum values
    let paymentStatus = "pending";
    let orderStatus = "pending";

    if (orderState === "COMPLETED") {
      paymentStatus = "completed";
      orderStatus = "paid";
    } else if (orderState === "FAILED") {
      paymentStatus = "failed";
      orderStatus = "pending";
    }
    

    // Create payment entry if it doesn't exist (after redirect)
    const [existingPayment] = await connection.execute(
      "SELECT payment_id FROM payments WHERE order_id = ?",
      [merchantOrderId]
    );

    if (existingPayment.length === 0) {
      // Get order amount
      const [orderData] = await connection.execute(
        "SELECT total FROM orders WHERE order_id = ?",
        [merchantOrderId]
      );

      if (orderData.length > 0) {
        const [paymentResult] = await connection.execute(
          "SELECT COALESCE(MAX(payment_id), 0) + 1 as next_id FROM payments"
        );
        const payment_id = paymentResult[0].next_id;

        await connection.execute(
          "INSERT INTO payments (payment_id, order_id, user_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), transaction_ref = VALUES(transaction_ref)",
          [
            payment_id,
            merchantOrderId,
            userId,
            orderData[0].total,
            "phonepe",
            paymentStatus,
            transactionId,
          ]
        );
      }
    } else {
      // Update existing payment
      await connection.execute(
        "UPDATE payments SET status = ?, transaction_ref = ? WHERE order_id = ?",
        [paymentStatus, transactionId, merchantOrderId]
      );
    }

    // Update order status
    await connection.execute(
      "UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?",
      [orderStatus, paymentStatus, merchantOrderId]
    );

    // If session has address but DB doesn’t, insert it
    if (req.session.checkoutAddress) {
      const addr = req.session.checkoutAddress;
      await connection.execute(
        `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
        address_line1 = VALUES(address_line1),
        address_line2 = VALUES(address_line2),
        city = VALUES(city),
        state = VALUES(state),
        pincode = VALUES(pincode)`,
        [userId, addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode]
      );
    }

    if (req.session.checkoutAddress) {
      const addr = req.session.checkoutAddress;
      await connection.execute(
        `UPDATE orders 
         SET address_line1 = ?, 
             address_line2 = ?, 
             city = ?, 
             state = ?, 
             pincode = ?
         WHERE order_id = ?`,
        [
          addr.address_line1,
          addr.address_line2,
          addr.city,
          addr.state,
          addr.pincode,
          merchantOrderId,
        ]
      );
    }


    // Get address information from addresses table
    const [addressData] = await connection.execute(
      "SELECT address_line1, address_line2, city, state, pincode FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    console.log(`Address data: ${addressData}`);

    await connection.commit();

    console.log(
      `Database updated - OrderId: ${merchantOrderId}, PaymentStatus: ${paymentStatus}, OrderStatus: ${orderStatus}`
    );

    res.json({ 
      orderStatus: response,
      address: addressData.length > 0 ? addressData[0] : null
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res
      .status(500)
      .json({ error: "Error fetching order status", details: err.message });
  } finally {
    connection.release();
  }
});

// 5. Refund Payment
router.post("/refund", authMiddleware, async (req, res) => {
  const { orderId, amount, refundId } = req.body;
  if (!orderId || !amount || amount <= 0 || !refundId) {
    return res
      .status(400)
      .json({ error: "Invalid orderId, refundId or amount" });
  }

  try {
    const amountPaisa = Math.round(amount * 100);

    // Fetch payment_id from payments table
    const [[payment]] = await pool.query(
      "SELECT payment_id FROM payments WHERE order_id = ?",
      [orderId]
    );

    if (!payment || !payment.payment_id) {
      return res
        .status(400)
        .json({ error: "No payment found for this orderId" });
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

    const refundState = response?.data?.state?.toLowerCase() || "pending";
    const phonepeRefundTxnId = response?.data?.transactionId || null;

    // Update refunds table
    await pool.query(
      `UPDATE refunds
       SET status = ?, phonepe_refund_txn_id = ?, callback_data = ?
       WHERE refund_id = ?`,
      [refundState, phonepeRefundTxnId, JSON.stringify(response), refundId]
    );

    // Update payments table with refund_id
    await pool.query("UPDATE payments SET refund_id = ? WHERE payment_id = ?", [
      refundId,
      paymentId,
    ]);

    // If full refund, mark payment and order as refunded
    if (refundState === "success") {
      const [[{ total }]] = await pool.query(
        "SELECT total FROM orders WHERE order_id = ?",
        [orderId]
      );

      if (Number(amount) >= Number(total)) {
        await pool.query(
          "UPDATE payments SET status = ? WHERE payment_id = ?",
          ["refunded", paymentId]
        );
        await pool.query(
          "UPDATE orders SET payment_status = ? WHERE order_id = ?",
          ["refunded", orderId]
        );
      }
    }

    res.json({ refundStatus: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Refund failed", details: err.message });
  }
});

// 6. Webhook Callback (payments + refunds)
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const payload = req.body;
    const orderId = payload?.merchantOrderId;
    const txnId = payload?.transactionId;
    const refundId = payload?.refundId;
    const state = payload?.state || "PENDING";

    if (refundId) {
      await connection.execute(
        `UPDATE refunds 
         SET status = ?, phonepe_refund_txn_id = ?, callback_data = ?
         WHERE refund_id = ?`,
        [state.toLowerCase(), txnId, JSON.stringify(payload), refundId]
      );
    } else if (orderId) {
      // Map PhonePe states to database values
      let paymentStatus = "pending";
      let orderStatus = "pending";

      if (state === "COMPLETED") {
        paymentStatus = "completed";
        orderStatus = "paid";
      } else if (state === "FAILED") {
        paymentStatus = "failed";
        orderStatus = "pending";
      }

      // Update payment status
      await connection.execute(
        `UPDATE payments 
         SET status = ?, transaction_ref = ?
         WHERE order_id = ?`,
        [paymentStatus, txnId, orderId]
      );

      // Update order status
      await connection.execute(
        "UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?",
        [orderStatus, paymentStatus, orderId]
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error("Webhook error:", err);
    res
      .status(500)
      .json({ error: "Webhook handling failed", details: err.message });
  } finally {
    connection.release();
  }
});

// Get current order ID from session
router.get("/current-order", authMiddleware, async (req, res) => {
  const orderId = req.session.currentOrderId;
  if (!orderId) {
    return res.status(404).json({ error: "No current order found" });
  }
  res.json({ orderId });
});

export default router;
