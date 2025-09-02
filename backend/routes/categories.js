import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/database.js';
import { verifyToken, verifyAdmin } from './auth.js';

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/categories/');
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
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY category_name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create category (admin only)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const image_url = req.file ? `/uploads/categories/${req.file.filename}` : null;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO categories (category_name, description, image_url) VALUES (?, ?, ?)',
      [name, description || null, image_url]
    );
    
    res.status(201).json({ 
      message: 'Category created successfully',
      category_name: name 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category (admin only)
router.put('/:category_name', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const oldCategoryName = req.params.category_name;
    const image_url = req.file ? `/uploads/categories/${req.file.filename}` : undefined;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    let query, params;
    if (image_url) {
      query = 'UPDATE categories SET category_name = ?, description = ?, image_url = ? WHERE category_name = ?';
      params = [name, description || null, image_url, oldCategoryName];
    } else {
      query = 'UPDATE categories SET category_name = ?, description = ? WHERE category_name = ?';
      params = [name, description || null, oldCategoryName];
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
router.delete('/:category_name', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const categoryName = req.params.category_name;
    
    // Check if category is used by products
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category = ?',
      [categoryName]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category. It is being used by products.' 
      });
    }
    
    const [result] = await pool.execute('DELETE FROM categories WHERE category_name = ?', [categoryName]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router;