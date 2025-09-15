import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { redisClient } from '../config/redis.js';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();


router.post('/toggle-site', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { closed } = req.body; // true or false
    await redisClient.set('site_closed', closed ? '1' : '0');
    // res.json({ message: `Site mode set to ${closed ? 'closed' : 'open'}` });
    res.json({ closed })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error toggling site mode' });
  }
});


// POST create product with image
router.post('/create-product', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id, additional_info } = req.body;
    let imageUrl = null;
    let cloudinaryPublicId = null;
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      imageUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }
    
    let additionalInfoJson = null;
    if (additional_info) {
      additionalInfoJson = JSON.parse(additional_info);
      
      // Validate variant structure if variants exist
      if (additionalInfoJson.variants) {
        for (const variant of additionalInfoJson.variants) {
          if (!variant.id || !variant.name) {
            return res.status(400).json({ message: 'Each variant must have id and name' });
          }
          if (variant.stock < 0) {
            return res.status(400).json({ message: 'Variant stock cannot be negative' });
          }
        }
      }
    }
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, description, price, stock, category_id, image_url, cloudinary_public_id, additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category_id, imageUrl, cloudinaryPublicId, additionalInfoJson]
    );
    
    res.status(201).json({ 
      message: 'Product created successfully', 
      product_id: result.insertId,
      image_url: imageUrl
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// PUT update product
router.put('/products/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id, additional_info } = req.body;
    const productId = req.params.id;
    
    // Get current product to handle image replacement
    const [current] = await pool.execute('SELECT image_url, cloudinary_public_id FROM products WHERE product_id = ? AND is_deleted = FALSE', [productId]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let imageUrl = current[0].image_url;
    let cloudinaryPublicId = current[0].cloudinary_public_id;
    
    // If new image uploaded, delete old one and use new
    if (req.file) {
      if (current[0].cloudinary_public_id) {
        await deleteFromCloudinary(current[0].cloudinary_public_id);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      imageUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }
    
    const additionalInfoJson = additional_info ? JSON.parse(additional_info) : null;
    
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?, cloudinary_public_id = ?, additional_info = ? WHERE product_id = ?',
      [name, description, price, stock, category_id, imageUrl, cloudinaryPublicId, additionalInfoJson, productId]
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
    
    // Delete image from Cloudinary if exists
    if (product[0].cloudinary_public_id) {
      await deleteFromCloudinary(product[0].cloudinary_public_id);
    }
    
    // Permanently delete from database
    await pool.execute('DELETE FROM products WHERE product_id = ?', [productId]);
    
    res.json({ message: 'Product permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error permanently deleting product' });
  }
});

export default router;