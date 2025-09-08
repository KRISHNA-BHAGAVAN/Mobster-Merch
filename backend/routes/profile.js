import express from 'express';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload, uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

const router = express.Router();

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

    // Get current user for image handling
    const [currentUser] = await db.query('SELECT image_url, cloudinary_public_id FROM users WHERE user_id = ?', [req.session.userId]);
    
    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (imageFile) {
      // Delete old image from Cloudinary if exists
      if (currentUser[0]?.cloudinary_public_id) {
        await deleteFromCloudinary(currentUser[0].cloudinary_public_id);
      }
      
      // Upload new image to Cloudinary
      const result = await uploadToCloudinary(imageFile.buffer, 'profiles');
      updateFields.push('image_url = ?', 'cloudinary_public_id = ?');
      updateValues.push(result.secure_url, result.public_id);
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