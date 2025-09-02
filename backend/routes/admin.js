import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all products for admin
router.get('/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST create product with image
router.post('/products', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category, imageUrl]
    );
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      product_id: result.insertId,
      image_url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// PUT update product
router.put('/products/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const productId = req.params.id;
    
    // Get current product to handle image replacement
    const [current] = await pool.execute('SELECT image_url FROM products WHERE product_id = ?', [productId]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let imageUrl = current[0].image_url;
    
    // If new image uploaded, delete old one and use new
    if (req.file) {
      if (current[0].image_url) {
        const oldImagePath = `uploads/products/${path.basename(current[0].image_url)}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/products/${req.file.filename}`;
    }
    
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE product_id = ?',
      [name, description, price, stock, category, imageUrl, productId]
    );
    
    res.json({ message: 'Product updated successfully', image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE product
router.delete('/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product to delete associated image
    const [product] = await pool.execute('SELECT image_url FROM products WHERE product_id = ?', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete image file if exists
    if (product[0].image_url) {
      const imagePath = `uploads/products/${path.basename(product[0].image_url)}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete product from database
    await pool.execute('DELETE FROM products WHERE product_id = ?', [productId]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router;