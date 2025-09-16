import express from 'express';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create category (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    let image_url = null;
    let cloudinaryPublicId = null;
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'categories');
      image_url = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO categories (name, description, image_url, cloudinary_public_id) VALUES (?, ?, ?, ?)',
      [name, description || null, image_url, cloudinaryPublicId]
    );
    
    res.status(201).json({ 
      message: 'Category created successfully',
      category_id: result.insertId,
      name: name 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});


router.put('/:category_id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.category_id;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Get current category for image handling
    const [current] = await pool.execute('SELECT image_url, cloudinary_public_id FROM categories WHERE category_id = ?', [categoryId]);
    if (current.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    let image_url = current[0].image_url;
    let cloudinaryPublicId = current[0].cloudinary_public_id;
    
    // If new image uploaded, delete old one and use new
    if (req.file) {
      if (current[0].cloudinary_public_id) {
        await deleteFromCloudinary(current[0].cloudinary_public_id);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'categories');
      image_url = result.secure_url;
      cloudinaryPublicId = result.public_id;
    }
    
    const [result] = await pool.execute(
      'UPDATE categories SET name = ?, description = ?, image_url = ?, cloudinary_public_id = ? WHERE category_id = ?',
      [name, description || null, image_url, cloudinaryPublicId, categoryId]
    );
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category (admin only)
// Note: We'll use 'category_id' to delete
router.delete('/:category_id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.category_id;
    
    // Set category_id to NULL for products using this category
    await pool.execute(
      'UPDATE products SET category_id = NULL WHERE category_id = ?',
      [categoryId]
    );
    
    const [result] = await pool.execute('DELETE FROM categories WHERE category_id = ?', [categoryId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;