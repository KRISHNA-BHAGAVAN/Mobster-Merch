import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.PRODUCT_UPLOADS);
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


// POST create product with image
router.post('/create-product', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const imageUrl = req.file ?`${process.env.PRODUCT_UPLOADS?.replace(/^\//, '')}/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category_id, imageUrl]
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
router.put('/products/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    const productId = req.params.id;
    
    // Get current product to handle image replacement
    const [current] = await pool.execute('SELECT image_url FROM products WHERE product_id = ? AND is_deleted = FALSE', [productId]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let imageUrl = current[0].image_url;
    
    // If new image uploaded, delete old one and use new
    if (req.file) {
      if (current[0].image_url) {
        const oldImagePath = path.join(process.env.PRODUCT_UPLOADS, path.basename(current[0].image_url));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `${process.env.PRODUCT_UPLOADS?.replace(/^\//, '')}/${req.file.filename}`;
    }
    
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ? WHERE product_id = ?',
      [name, description, price, stock, category_id, imageUrl, productId]
    );
    
    res.json({ message: 'Product updated successfully', image_url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE product (soft delete)
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists and is not already deleted
    const [product] = await pool.execute('SELECT * FROM products WHERE product_id = ? AND is_deleted = FALSE', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Soft delete - mark as deleted instead of removing from database
    await pool.execute('UPDATE products SET is_deleted = TRUE WHERE product_id = ?', [productId]);
    
    res.json({ message: 'Product stopped displaying successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// PUT restore product
router.put('/products/:id/restore', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists and is deleted
    const [product] = await pool.execute('SELECT * FROM products WHERE product_id = ? AND is_deleted = TRUE', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Deleted product not found' });
    }
    
    // Restore product - mark as not deleted
    await pool.execute('UPDATE products SET is_deleted = FALSE WHERE product_id = ?', [productId]);
    
    res.json({ message: 'Product restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring product' });
  }
});

// DELETE product permanently
router.delete('/products/:id/permanent', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists and is soft deleted
    const [product] = await pool.execute('SELECT * FROM products WHERE product_id = ? AND is_deleted = TRUE', [productId]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Deleted product not found' });
    }
    
    // Delete image file if exists
    if (product[0].image_url) {
      const imagePath = path.join(process.env.PRODUCT_UPLOADS, path.basename(product[0].image_url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Permanently delete from database
    await pool.execute('DELETE FROM products WHERE product_id = ?', [productId]);
    
    res.json({ message: 'Product permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error permanently deleting product' });
  }
});

export default router;