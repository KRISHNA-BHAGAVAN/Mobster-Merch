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
const phonepeEnv = (process.env.PHONEPE_ENV).toUpperCase();
const env = phonepeEnv === "SANDBOX" ? Env.SANDBOX : Env.PRODUCTION; 

console.log('PhonePe SDK Config:', {
  clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
  clientSecret: clientSecret ? 'SET' : 'MISSING',
  clientVersion,
  env: phonepeEnv
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
  const redirectUrl = `${MERCHANT_REDIRECT_URL}/payment-success?orderId=${merchantOrderId}`;
  
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
      console.log(`📦 Address stored in session for order ${merchantOrderId}:`, req.body.address);
    } else {
      console.log(`⚠️ No address provided in payment request for order ${merchantOrderId}`);
    }
    const response = await phonePeClient.pay(request);

    res.json({
      checkoutUrl: response.redirectUrl,
      phonepeOrderId: response.order_id,
      state: response.state,
    });

  } catch (err) {
    console.error('PhonePe pay error:', err);
    
    // Handle INTERNAL_SECURITY_BLOCK_1 specifically
    if (err.message && err.message.includes('INTERNAL_SECURITY_BLOCK_1')) {
      return res.status(403).json({
        error: "MERCHANT_ONBOARDING_REQUIRED",
        details: "Your merchant account requires onboarding. Please complete merchant verification.",
        onboardingUrls: ["https://mobstermerch.store/"],
        phonepeError: err.message
      });
    }
    
    res.status(500).json({ 
      error: "Payment initiation failed", 
      details: err.message || "Unknown error"
    });
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

    // Update order status and address if payment is completed
    if (orderState === "COMPLETED") {
      let addressUpdate = "";
      let addressParams = [orderStatus, paymentStatus, merchantOrderId];
      
      // Check if address is stored in current session
      if (req.session && req.session.checkoutAddress) {
        const addr = req.session.checkoutAddress;
        addressUpdate = ", address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, country = ?, pincode = ?";
        addressParams = [
          orderStatus, paymentStatus,
          addr.address_line1 || null,
          addr.address_line2 || null, 
          addr.city || null,
          addr.district || null,
          addr.state || null,
          addr.country || null,
          addr.pincode || null,
          merchantOrderId
        ];
        
        // Clear address from session and cart
        delete req.session.checkoutAddress;
        
        // Clear cart for this user when payment is completed
        await connection.execute(
          "DELETE FROM cart WHERE user_id = ?",
          [userId]
        );
        
        console.log(`✅ Address updated for order ${merchantOrderId}, cart cleared, and session cleaned`);
      } else {
        console.log(`⚠️ No address found in session for order ${merchantOrderId}`);
        
        // Still clear cart even if no address
        await connection.execute(
          "DELETE FROM cart WHERE user_id = ?",
          [userId]
        );
      }
      
      await connection.execute(
        `UPDATE orders SET status = ?, payment_status = ?${addressUpdate} WHERE order_id = ?`,
        addressParams
      );
    } else {
      await connection.execute(
        "UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?",
        [orderStatus, paymentStatus, merchantOrderId]
      );
    }

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

// 4. Create SDK Order (for mobile/frontend SDK integration)
router.post("/create-sdk-order", authMiddleware, async (req, res) => {
  const { orderId, amount } = req.body;
  const userId = req.session.userId;
  
  if (!orderId || !amount || Number(amount) <= 0 || !userId) {
    return res.status(400).json({ error: "Invalid parameters" });
  }
  
  const merchantOrderId = orderId;
  const amountPaisa = Math.round(amount * 100);
  const redirectUrl = `${MERCHANT_REDIRECT_URL}/payment-success?orderId=${merchantOrderId}`;
  
  try {
    await ensureOrder(merchantOrderId, userId, amount);
    
    const sdkRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amountPaisa)
      .redirectUrl(redirectUrl)
      .build();
    
    const sdkResponse = await phonePeClient.createSdkOrder(sdkRequest);
    
    res.json({
      token: sdkResponse.token,
      orderId: merchantOrderId,
      state: sdkResponse.state
    });
  } catch (err) {
    console.error("SDK order creation error:", err);
    res.status(500).json({ error: "SDK order creation failed", details: err.message });
  }
});

// 5. Webhook Handler
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const rawBody = req.body.toString();
    const callbackData = JSON.parse(rawBody);
    
    console.log('PhonePe Webhook received:', callbackData);
    
    const merchantOrderId = callbackData.merchantOrderId;
    const state = callbackData.state;
    const transactionId = callbackData.transactionId;
    
    if (!merchantOrderId) {
      return res.status(400).send("Missing merchantOrderId");
    }
    
    // Map PhonePe states
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
      "UPDATE payments SET status = ?, transaction_ref = ? WHERE order_id = ?",
      [paymentStatus, transactionId, merchantOrderId]
    );
    
    // Update order status and address if payment is completed
    if (state === "COMPLETED") {
      // For webhook, we can't access session data directly
      // The address should have been stored when the order was created
      // Just update the order status and clear cart
      
      // Get user_id from order to clear cart
      const [orderData] = await connection.execute(
        "SELECT user_id FROM orders WHERE order_id = ?",
        [merchantOrderId]
      );
      
      if (orderData.length > 0) {
        await connection.execute(
          "DELETE FROM cart WHERE user_id = ?",
          [orderData[0].user_id]
        );
        console.log(`✅ Order ${merchantOrderId} status updated via webhook, cart cleared for user ${orderData[0].user_id}`);
      }
      
      await connection.execute(
        "UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?",
        [orderStatus, paymentStatus, merchantOrderId]
      );
    } else {
      await connection.execute(
        "UPDATE orders SET status = ?, payment_status = ? WHERE order_id = ?",
        [orderStatus, paymentStatus, merchantOrderId]
      );
    }
    
    await connection.commit();
    res.status(200).send("OK");
  } catch (err) {
    await connection.rollback();
    console.error("Webhook handling error:", err);
    res.status(500).send("Error");
  } finally {
    connection.release();
  }
});

// 6. Get Current Order ID from Session
router.get("/current-order", authMiddleware, async (req, res) => {
  const orderId = req.session.currentOrderId;
  if (!orderId) {
    return res.status(404).json({ error: "No current order found" });
  }
  res.json({ orderId });
});

export default router;