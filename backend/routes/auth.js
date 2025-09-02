import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import pool from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Generate unique 4-digit user ID
const generateUniqueUserId = async () => {
  let userId;
  let exists = true;
  
  while (exists) {
    userId = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const [result] = await pool.execute('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    exists = result.length > 0;
  }
  
  return userId;
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Register request:', { name, email, password: '***', phone });
    
    // Validate required fields
    if (!name || !email || !password || !phone) {
      console.log('Validation failed:', { name: !!name, email: !!email, password: !!password, phone: !!phone });
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }
    
    // Check if user exists
    const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate unique 4-digit user ID
    const userId = await generateUniqueUserId();
    
    // Create user with custom user_id
    await pool.execute(
      'INSERT INTO users (user_id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, hashedPassword, phone]
    );
    
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`);
    // Find user by email or username (using email field for both)
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ? OR name = ?', [email, email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if admin credentials (either hardcoded admin or user with admin role)
    const isAdmin = (email === 'admin' && password === 'password') || user.role === 'admin';
    
    const token = jwt.sign({ userId: user.user_id, isAdmin }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.user_id, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: { id: user.user_id, name: user.name, email: user.email },
      isAdmin
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', { userId: decoded.userId, isAdmin: decoded.isAdmin });
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin verification middleware
export const verifyAdmin = (req, res, next) => {
  console.log('Admin verification - isAdmin:', req.isAdmin, 'userId:', req.userId);
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Logout route
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Refresh token route
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = jwt.sign({ userId: decoded.userId, isAdmin: decoded.isAdmin }, JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: decoded.userId, isAdmin: decoded.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT user_id, name, email, phone, created_at FROM users WHERE user_id = ?',
      [req.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT user_id, name, email, phone, image_url FROM users WHERE user_id = ?',
      [req.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    let updateFields = [];
    let values = [];
    
    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    
    if (phone) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      updateFields.push('image_url = ?');
      values.push(imageUrl);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(req.userId);
    
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      values
    );
    
    // Get updated user data
    const [users] = await pool.execute(
      'SELECT user_id, name, email, phone, image_url FROM users WHERE user_id = ?',
      [req.userId]
    );
    
    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;