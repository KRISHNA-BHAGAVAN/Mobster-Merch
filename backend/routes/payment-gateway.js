import express from "express";
import axios from "axios";
import pool from "../config/database.js"; 
const router = express.Router();


console.log("PhonePe Client ID:", process.env.NODE_ENV);

const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"; 

/**
 * Step 1: Get access token asynchronously
 */
async function getAccessToken() {
    try {
        const requestHeaders = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        
        const requestBody = new URLSearchParams({
            client_id: process.env.PHONEPE_CLIENT_ID,
            client_secret: process.env.PHONEPE_CLIENT_SECRET,
            grant_type: "client_credentials",
            client_version: process.env.PHONEPE_CLIENT_VERSION,
        }).toString();

        const options = {
            method: 'POST',
            url: `${PHONEPE_BASE_URL}/v1/oauth/token`,
            headers: requestHeaders,
            data: requestBody
        };
        
        const response = await axios.request(options);
        console.log(`Access token: ${response.data.access_token}`);
        return response.data.access_token;

    } catch (error) {
        console.error("Access Token Error:", error.response?.data || error.message);
        throw new Error("Failed to retrieve access token.");
    }
}

/**
 * Step 2: Create payment order
 */
router.post("/create-order", async (req, res) => {
  const { orderId, amount } = req.body;
  const userId = req.session.userId; // Get from session

  console.log("details for order id:", orderId, userId, amount);
  // Basic validation to prevent sending null values
  if (!orderId || !userId || !amount) {
    return res.status(400).json({ error: "Missing required parameters: orderId, userId, and amount are mandatory." });
  }

  try {
    const merchantAuthToken = await getAccessToken();

    const requestHeaders = {
      "Content-Type": "application/json",
      "Authorization": `O-Bearer ${merchantAuthToken}`
    };

    const requestBody = {
      "merchantOrderId": orderId,
      "amount": Math.round(amount * 100), // Amount in paisa
      "expireAfter": 1200,
      "metaInfo": {
        "user_id": userId,
      },
      "paymentFlow": {
        "type": "PG_CHECKOUT",
        "merchantUrls": {
          "redirectUrl": "http://localhost:5173/payment-success"
        }
      }
    };

    const options = {
      method: 'POST',
      url: `${PHONEPE_BASE_URL}/checkout/v2/pay`,
      headers: requestHeaders,
      data: requestBody
    };

    const response = await axios.request(options);
    console.log(response.data);

    // The response.data directly contains the required fields
    const { redirectUrl } = response.data;
    
    // Store cart items in session for order creation after payment
    const [cartItems] = await pool.execute(
      'SELECT c.product_id, c.quantity, p.price, p.name FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ?',
      [userId]
    );
    
    req.session.pendingOrder = {
      orderId,
      userId,
      amount,
      cartItems
    };

    // Send the redirectUrl to the client
    res.json({ redirectUrl: redirectUrl });

  } catch (error) {
    console.error("Payment Creation Error:", error.response?.data || error.message);
    res.status(500).json({ error: "An error occurred during payment creation." });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Payment route is working!" });
});
/**
 * Step 3: Callback webhook
 */
router.post("/callback", async (req, res) => {
  const { orderId } = req.query;
  const callbackData = req.body;

  try {
    // Store callback JSON
    await pool.execute(
      "UPDATE payments SET callback_data = ?, status = ? WHERE order_id = ?",
      [JSON.stringify(callbackData), callbackData.code === "PAYMENT_SUCCESS" ? "success" : "failed", orderId]
    );

    // Update orders table
    if (callbackData.code === "PAYMENT_SUCCESS") {
      await pool.execute(
        "UPDATE orders SET payment_status = ?, status = ? WHERE order_id = ?",
        ["success", "paid", orderId]
      );
    } else {
      await pool.execute(
        "UPDATE orders SET payment_status = ?, status = ? WHERE order_id = ?",
        ["failed", "cancelled", orderId]
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Callback Error:", err.message);
    res.status(500).json({ error: "Callback handling failed" });
  }
});

/**
 * Step 4: Verify Payment Status (optional, but recommended)
 */
router.get("/status/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const merchantAuthToken = await getAccessToken();
    const { data } = await axios.get(
      `${PHONEPE_BASE_URL}/pg/v1/status/${orderId}`,
      { headers: { Authorization: `Bearer ${merchantAuthToken}` } }
    );

    res.json(data);
  } catch (err) {
    console.error("Status Check Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Status check failed" });
  }
});

// Create order after successful payment
router.post("/create-order-after-payment", async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.session.userId;
    const pendingOrder = req.session.pendingOrder;
    
    if (!pendingOrder) {
      return res.status(400).json({ message: 'No pending order found' });
    }
    
    const { orderId, amount, cartItems } = pendingOrder;
    
    // Check if order already exists
    const [existingOrder] = await connection.execute(
      'SELECT order_id FROM orders WHERE order_id = ?',
      [orderId]
    );
    
    if (existingOrder.length > 0) {
      // Order already exists, return existing order details
      await connection.commit();
      return res.json({
        message: 'Order already exists',
        order_id: orderId,
        total: amount,
        items: cartItems
      });
    }
    
    // Create order with paid status
    await connection.execute(
      'INSERT INTO orders (order_id, user_id, total, status, payment_status) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId, amount, 'paid', 'success']
    );
    
    // Insert order items
    for (const item of cartItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    // Create payment record
    const [paymentResult] = await connection.execute(
      'SELECT COALESCE(MAX(payment_id), 0) + 1 as next_id FROM payments'
    );
    const payment_id = paymentResult[0].next_id;
    
    await connection.execute(
      'INSERT INTO payments (payment_id, order_id, user_id, amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [payment_id, orderId, userId, amount, 'success', 'phonepe']
    );
    
    // Clear cart
    await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
    
    // Clear session
    delete req.session.pendingOrder;
    
    await connection.commit();
    
    res.json({
      message: 'Order created successfully',
      order_id: orderId,
      total: amount,
      items: cartItems
    });
    
  } catch (error) {
    console.error('Order creation after payment error:', error);
    await connection.rollback();
    res.status(500).json({ message: 'Error creating order after payment' });
  } finally {
    connection.release();
  }
});

export default router;
