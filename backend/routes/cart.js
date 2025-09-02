import express from 'express';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Add to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.userId;

    // Check if item already in cart
    const [existing] = await pool.execute(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE cart_id = ?',
        [newQuantity, existing[0].cart_id]
      );
      res.json({ message: 'Cart updated', cart_id: existing[0].cart_id });
    } else {
      // Insert new item
      const [result] = await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
      res.status(201).json({ message: 'Added to cart', cart_id: result.insertId });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Get cart items
router.get('/', verifyToken, async (req, res) => {
  try {
    const user_id = req.userId;
    const [rows] = await pool.execute(`
      SELECT c.cart_id, c.quantity, p.product_id, p.name, p.price, p.image_url, p.stock,
             (c.quantity * p.price) AS subtotal
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `, [user_id]);
    
    res.json(rows);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Update cart quantity
router.put('/:cart_id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE cart_id = ?',
      [quantity, req.params.cart_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove from cart
router.delete('/:cart_id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM cart WHERE cart_id = ?', [req.params.cart_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Update cart quantity by product_id
router.put('/product/:product_id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user_id = req.userId;
    const product_id = req.params.product_id;
    
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove from cart by product_id
router.delete('/product/:product_id', verifyToken, async (req, res) => {
  try {
    const user_id = req.userId;
    const product_id = req.params.product_id;
    
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

export default router;