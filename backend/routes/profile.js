import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../config/database.js'; // Assuming this is your db connection pool
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the PROFILE_UPLOADS environment variable as specified
    cb(null, process.env.PROFILE_UPLOADS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get Profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    // The query and column names match the new schema
    const [rows] = await db.query(
      'SELECT user_id, name, email, phone, image_url, is_admin FROM users WHERE user_id = ?',
      [req.session.userId]
    );

    if (!rows.length) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image_url: user.image_url || null,
      // is_admin (TINYINT) is correctly converted to a boolean
      isAdmin: Boolean(user.is_admin)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.put('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // This check is good practice, preventing admins from modifying their profile via this route
    const [adminCheck] = await db.query('SELECT is_admin FROM users WHERE user_id = ?', [req.session.userId]);
    if (adminCheck.length > 0 && adminCheck[0].is_admin) {
      return res.status(403).json({ error: 'Admin profile cannot be updated via this route' });
    }

    const { name, phone } = req.body;
    const imageFile = req.file;

    let updateFields = [];
    let updateValues = [];

    // All column names (name, phone, image_url) are correct
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (imageFile) {
      const imagePath = `/uploads/profiles/${imageFile.filename}`;
      updateFields.push('image_url = ?');
      updateValues.push(imagePath);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add user_id to the end of the values array for the WHERE clause
    updateValues.push(req.session.userId);

    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    // Get updated user data
    // Query and column names are correct
    const [rows] = await db.query(
      'SELECT user_id, name, email, phone, image_url FROM users WHERE user_id = ?',
      [req.session.userId]
    );

    const user = rows[0];
    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image_url: user.image_url || null
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;