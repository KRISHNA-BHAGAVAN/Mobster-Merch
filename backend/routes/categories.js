import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

// Configure multer for category image uploads
// The destination path is now read from the .env file as you specified
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.CATEGORY_UPLOADS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    // Note: The new table has 'category_id', 'name', 'description', and 'image_url'
    const [categories] = await pool.execute('SELECT category_id, name, description, image_url, created_at FROM categories ORDER BY name');
    
    if (categories.length === 0) {
      return res.json({ message: 'No categories added in the database', categories: [] });
    }
    
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
    const image_url = req.file ? `${process.env.CATEGORY_UPLOADS?.replace(/^\//, '')}/${req.file.filename}` : null;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description || null, image_url]
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
    const image_url = req.file ? `${(process.env.CATEGORY_UPLOADS)?.replace(/^\//, '')}/${req.file.filename}` : undefined;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    let query, params;
    // Check if a new image was uploaded to update the image_url
    if (image_url) {
      query = 'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE category_id = ?';
      params = [name, description || null, image_url, categoryId];
    } else {
      // If no new image, update only name and description
      query = 'UPDATE categories SET name = ?, description = ? WHERE category_id = ?';
      params = [name, description || null, categoryId];
    }
    
    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
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