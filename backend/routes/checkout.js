import express from "express";
import pool from "../config/database.js";
import { authMiddleware } from "../middleware/auth.js";
import { redisClient } from "../config/redis.js";


const paymentMode = await redisClient.get("payment_mode") || "manual";


const router = express.Router();

// Generate unique 6-character alphanumeric order ID
const generateUniqueOrderId = async (connection) => {
  let orderId;
  let exists = true;

  while (exists) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    orderId = "";
    for (let i = 0; i < 6; i++) {
      orderId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM orders WHERE order_id = ?",
      [orderId]
    );
    exists = existing[0].count > 0;
  }

  return orderId;
};

// Prepare checkout data
router.post("/prepare-checkout", authMiddleware, async (req, res) => {
  try {
    const user_id = req.session.userId;
    console.log(req.body);
    const { address_line1, address_line2, city, district, state, country, pincode } = req.body;

    // Validate address
    if (!address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "Complete address is required" });
    }
    // const addr = await pool.query(
    //     `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, pincode, is_default)
    //     VALUES (?, ?, ?, ?, ?, ?, 1)
    //     ON DUPLICATE KEY UPDATE
    //     address_line1 = VALUES(address_line1),
    //     address_line2 = VALUES(address_line2),
    //     city = VALUES(city),
    //     state = VALUES(state),
    //     pincode = VALUES(pincode)`,
    //     [user_id, address_line1, address_line2 || "", city, state, pincode]
    //   );

    //   console.log("Address stored on Database:",addr)
    
    req.session.checkoutAddress = {
      address_line1,
      address_line2: address_line2 || null,
      city,
      district: district || null,
      state,
      country: country || null,
      pincode
    };
    console.log('📦 DEBUG: Address stored in session:', req.session.checkoutAddress);
    
    // Get cart items with variant pricing
    const [cartItems] = await pool.execute(
      `SELECT c.product_id, c.quantity, c.variant_id, p.price, p.stock, p.name, p.additional_info
       FROM cart c JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ? AND p.is_deleted = 0`,
      [user_id]
    );
    
    // Calculate correct prices using absolute variant pricing
    const cartItemsWithCorrectPrices = cartItems.map(item => {
      let finalPrice = parseFloat(item.price);
      
      if (item.additional_info) {
        try {
          const additionalInfo = typeof item.additional_info === 'string' 
            ? JSON.parse(item.additional_info) 
            : item.additional_info;
          
          if (additionalInfo.variants && additionalInfo.variants.length > 0) {
            if (item.variant_id) {
              const selectedVariant = additionalInfo.variants.find(v => v.id === item.variant_id);
              if (selectedVariant) {
                finalPrice = parseFloat(selectedVariant.price || 0);
              }
            } else {
              const defaultVariant = additionalInfo.variants.find(v => v.is_default) || additionalInfo.variants[0];
              if (defaultVariant) {
                finalPrice = parseFloat(defaultVariant.price || 0);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing variant info:', e);
        }
      }
      
      return {
        ...item,
        price: finalPrice
      };
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock availability
    for (const item of cartItemsWithCorrectPrices) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${item.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Calculate total with correct variant pricing
    const total = cartItemsWithCorrectPrices.reduce((sum, item) => sum + item.quantity * item.price, 0);
    
    // Get payment method setting
    const [paymentSettings] = await pool.execute(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['payment_method']
    );
    const paymentMethod = paymentSettings.length > 0 ? paymentSettings[0].setting_value : 'manual';
    
    if (paymentMethod === 'phonepe') {
      // For PhonePe, create a proper order ID that can be used
      const connection = await pool.getConnection();
      try {
        const order_id = await generateUniqueOrderId(connection);
        
        // Create a pending order for PhonePe (without address)
        await connection.execute(
          "INSERT INTO orders (order_id, user_id, total, status, payment_status) VALUES (?, ?, ?, ?, ?)",
          [order_id, user_id, total, "pending", "pending"]
        );
        
        // Insert order items with correct variant pricing
        for (const item of cartItemsWithCorrectPrices) {
          await connection.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [order_id, item.product_id, item.quantity, item.price]
          );
        }
        
        res.json({
          message: "Checkout prepared",
          order_id,
          total,
          payment_method: 'phonepe',
          address: { address_line1, address_line2, city, district, state, country, pincode },
          cart_items: cartItemsWithCorrectPrices
        });
      } finally {
        connection.release();
      }
    } else {
      // Generate temp order ID for manual payment
      const temp_order_id = Date.now().toString();
      const upiId = "mobster@ptaxis";
      const upiLink = `upi://pay?pa=${upiId}&pn=OG Merchandise&am=${total}&cu=INR&tn=Order${temp_order_id}`;

      res.json({
        message: "Checkout prepared",
        temp_order_id,
        total,
        upi_link: upiLink,
        upi_id: upiId,
        payment_method: 'manual',
        address: { address_line1, address_line2, city, district, state, country, pincode },
        cart_items: cartItemsWithCorrectPrices
      });
    }
  } catch (error) {
    console.error("Checkout preparation error:", error);
    res.status(500).json({ message: "Error preparing checkout" });
  }
});

// Get user addresses
router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const [addresses] = await pool.execute(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [req.session.userId]
    );

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
});

// Create actual order when payment is submitted
router.post("/create-order-with-payment", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const user_id = req.session.userId;
    const { address, transaction_id, screenshot_url } = req.body;
    
    // Get current cart items with variant pricing
    const [cartItems] = await connection.execute(
      `SELECT c.product_id, c.quantity, c.variant_id, p.price, p.stock, p.name, p.additional_info
       FROM cart c JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = ? AND p.is_deleted = 0`,
      [user_id]
    );
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    
    // Calculate correct prices using absolute variant pricing
    const cartItemsWithCorrectPrices = cartItems.map(item => {
      let finalPrice = parseFloat(item.price);
      
      if (item.additional_info) {
        try {
          const additionalInfo = typeof item.additional_info === 'string' 
            ? JSON.parse(item.additional_info) 
            : item.additional_info;
          
          if (additionalInfo.variants && additionalInfo.variants.length > 0) {
            if (item.variant_id) {
              const selectedVariant = additionalInfo.variants.find(v => v.id === item.variant_id);
              if (selectedVariant) {
                finalPrice = parseFloat(selectedVariant.price || 0);
              }
            } else {
              const defaultVariant = additionalInfo.variants.find(v => v.is_default) || additionalInfo.variants[0];
              if (defaultVariant) {
                finalPrice = parseFloat(defaultVariant.price || 0);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing variant info:', e);
        }
      }
      
      return {
        ...item,
        price: finalPrice
      };
    });
    
    const total = cartItemsWithCorrectPrices.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const order_id = await generateUniqueOrderId(connection);
    
    // Save address
    await connection.execute(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, district, state, country, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE
       address_line1 = VALUES(address_line1), address_line2 = VALUES(address_line2),
       city = VALUES(city), district = VALUES(district), state = VALUES(state), country = VALUES(country), pincode = VALUES(pincode)`,
      [user_id, address.address_line1, address.address_line2 || "", address.city, address.district || "", address.state, address.country || "", address.pincode]
    );
    
    // Create order
    await connection.execute(
      "INSERT INTO orders (order_id, user_id, total, status) VALUES (?, ?, ?, ?)",
      [order_id, user_id, total, "pending"]
    );
    
    // Insert order items with correct variant pricing
    for (const item of cartItemsWithCorrectPrices) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order_id, item.product_id, item.quantity, item.price]
      );
    }
    
    // Create payment verification
    await connection.execute(
      `INSERT INTO payment_verifications (order_id, user_id, transaction_id, screenshot_url, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, user_id, transaction_id, screenshot_url, total, "pending"]
    );
    
    // Clear cart
    await connection.execute("DELETE FROM cart WHERE user_id = ?", [user_id]);
    
    await connection.commit();
    
    res.json({ message: "Order created and payment submitted for verification", order_id });
  } catch (error) {
    console.error("Order creation error:", error);
    await connection.rollback();
    res.status(500).json({ message: "Error creating order" });
  } finally {
    connection.release();
  }
});

export default router;
