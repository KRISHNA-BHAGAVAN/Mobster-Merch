// server.js
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { RedisStore } from 'connect-redis';
import Redis from 'ioredis';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import productRoutes from './routes/product.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import paymentRoutes from './routes/payments.js';
import settingsRoutes from './routes/settings.js';

dotenv.config({ path: '../.env', override: true });

// Debug: Check if SESSION_SECRET is loaded
console.log('SESSION_SECRET loaded:', !!process.env.SESSION_SECRET);

// ---------------------
// Init
// ---------------------
const __dirname = import.meta.dirname;
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---------------------
// Redis (for session store)
// ---------------------
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Redis connection debugging
redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
})); // sets security headers
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200, // limit each IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---------------------
// CORS
// ---------------------
app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ---------------------
// Parsers
// ---------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Session configuration
// ---------------------
app.use(
  session({
    store: redisStore,
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: NODE_ENV === 'production', // only over HTTPS in prod
      // sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // allow cross-site cookies in prod
      secure: false, 
      sameSite: 'Lax', 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


// ---------------------
// Static file serving
// ---------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
app.use('/uploads/products', express.static(path.join(__dirname, 'uploads/products')));
app.use('/uploads/categories', express.static(path.join(__dirname, 'uploads/categories')));

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);

// ---------------------
// Health check route
// ---------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Your Merchandise API is running fine' });
});

// ---------------------
// Error handling middleware
// ---------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
});
