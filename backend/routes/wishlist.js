import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET user's wishlist
router.get('/', async (req, res) => {
  try {
    console.log('User from session:', req.session.userId);
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const [rows] = await pool.execute(`
      SELECT w.*, p.name, p.price, p.image_url, p.stock, c.name as category_name
      FROM wishlist w
      JOIN products p ON w.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE w.user_id = ? AND p.is_deleted = FALSE
      ORDER BY w.added_at DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// POST add to wishlist
router.post('/add', async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user?.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Check if already in wishlist
    const [existing] = await pool.execute(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    await pool.execute(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );
    
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// DELETE remove from wishlist
router.delete('/remove/:product_id', async (req, res) => {
  try {
    const userId = req.user?.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    await pool.execute(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, req.params.product_id]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// GET check if product is in wishlist
router.get('/check/:product_id', async (req, res) => {
  try {
    const userId = req.user?.userId || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, req.params.product_id]
    );
    res.json({ inWishlist: rows.length > 0 });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Error checking wishlist' });
  }
});

export default router;