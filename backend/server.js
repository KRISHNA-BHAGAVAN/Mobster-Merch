import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import paymentRoutes from './routes/payments.js';
import path from 'path';

console.log(import.meta.dirname);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('/var/www/uploads'));
app.use('/uploads/profiles', express.static('/var/www/uploads/profiles'));
app.use('/uploads/products', express.static('/var/www/uploads/products'));
app.use('/uploads/categories', express.static('/var/www/uploads/categories'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

app.use("/health",(req, res) => {
  res.send("Your Merchandise API is running fine");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
