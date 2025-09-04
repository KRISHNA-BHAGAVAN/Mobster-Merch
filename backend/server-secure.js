import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import secureAuthRoutes from './routes/secure-auth.js';
import secureCartRoutes from './routes/secure-cart.js';
import productRoutes from './routes/product.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static('/var/www/uploads'));

// Routes
app.use('/api/auth', secureAuthRoutes);
app.use('/api/cart', secureCartRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Secure session server running' });
});

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});