// backend/routes/phonepe-sdk.js
import express from "express";
import dotenv from "dotenv";
import pool from "../config/database.js";
import { MERCHANT_REDIRECT_URL } from "../config/api.js";

import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
  CreateSdkOrderRequest,
} from "pg-sdk-node";
import { authMiddleware } from "../middleware/auth.js";

dotenv.config({ override: true });
console.log("MERCHANT_REDIRECT_URL: ",MERCHANT_REDIRECT_URL)
const router = express.Router();

// 1. Initialize PhonePe SDK
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION);
const env = Env.PRODUCTION; // Force production since you're using production credentials

console.log('PhonePe SDK Config:', {
  clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
  clientSecret: clientSecret ? 'SET' : 'MISSING',
  clientVersion,
  env: 'PRODUCTION'
});

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
  
  console.log('PhonePe Payment Request:', { orderId, amount, userId, body: req.body });
  
  if (!orderId || !amount || Number(amount) <= 0 || !userId) {
    console.log('Validation failed:', { orderId: !!orderId, amount: !!amount, amountValue: Number(amount), userId: !!userId });
    return res.status(400).json({ error: "Invalid orderId, amount or userId" });
  }

  const merchantOrderId = orderId;
  const amountPaisa = Math.round(amount * 100);
  const redirectUrl = `${MERCHANT_REDIRECT_URL}/payment-success`;
  
  console.log('PhonePe Request Details:', {
    merchantOrderId,
    amountPaisa,
    redirectUrl,
    MERCHANT_REDIRECT_URL
  });

  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaisa)
    .redirectUrl(redirectUrl)
    .build();
    
  console.log('PhonePe SDK Request:', {
    merchantOrderId,
    amount: amountPaisa,
    redirectUrl
  });

  try {
    await ensureOrder(merchantOrderId, userId, amount);

    // Store order ID in session for success page
    req.session.currentOrderId = merchantOrderId;
    
    // Store address in session if provided in request
    if (req.body.address) {
      req.session.checkoutAddress = req.body.address;
    }

    const response = await phonePeClient.pay(request);

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

// 3. Check Order Status
router.get("/order-status/:orderId", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  const merchantOrderId = req.params.orderId;
  if (!merchantOrderId)
    return res.status(400).json({ error: "Missing orderId" });

  try {
    await connection.beginTransaction();

    const response = await phonePeClient.getOrderStatus(merchantOrderId);
    const orderState = response?.state || "PENDING";
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
    
    // Create payment entry if it doesn't exist
    const [existingPayment] = await connection.execute(
      "SELECT payment_id FROM payments WHERE order_id = ?",
      [merchantOrderId]
    );

    if (existingPayment.length === 0) {
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
          "INSERT INTO payments (payment_id, order_id, user_id, amount, method, status, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

    await connection.commit();

    res.json({
      orderStatus: response,
      paymentStatus,
      orderState,
      transactionId
    });
  } catch (err) {
    await connection.rollback();
    console.error("Order status check error:", err);
    res.status(500).json({ error: "Failed to check order status", details: err.message });
  } finally {
    connection.release();
  }
});

// 4. Get Current Order ID from Session
router.get("/current-order", authMiddleware, async (req, res) => {
  const orderId = req.session.currentOrderId;
  if (!orderId) {
    return res.status(404).json({ error: "No current order found" });
  }
  res.json({ orderId });
});

export default router;