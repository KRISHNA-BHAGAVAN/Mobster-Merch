import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all products
router.get('/get-all-products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET products by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC',
      [category]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// POST create product
router.post('/add-product', async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, stock, category]
    );
    res.status(201).json({ message: 'Product created', product_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// PUT update product
router.put('/update-product/:id', async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE product_id = ?',
      [name, description, price, stock, category, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE product
router.delete('/delete-product/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router;