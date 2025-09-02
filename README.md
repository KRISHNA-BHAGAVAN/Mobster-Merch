# OG Merchandise - E-commerce Platform

A complete e-commerce platform for "They Call Him OG" movie merchandise built with React, Node.js, and MySQL.

## 🚀 Features

### Customer Features
- **User Authentication** - Register, login with JWT tokens
- **Product Browsing** - View products by categories with search functionality
- **Shopping Cart** - Add/remove items with quantity controls and stock validation
- **Order Management** - Place orders with UPI payment integration
- **Order Tracking** - View order history and status updates
- **Order Cancellation** - Request order cancellation with admin approval
- **Notifications** - Receive messages from admin and order updates
- **Profile Management** - Update profile information and upload profile pictures

### Admin Features
- **Dashboard** - Comprehensive admin panel with multiple tabs
- **Product Management** - CRUD operations for products with image uploads
- **Category Management** - Create and manage product categories
- **Order Management** - View all orders with status filters and manual updates
- **Payment Verification** - Verify and approve UPI payments
- **Cancellation Requests** - Approve or decline customer cancellation requests
- **Customer Messaging** - Send messages to customers with searchable user selection
- **Reports** - Daily sales reports and analytics
- **Notifications** - Manage refund requests and cancellation requests

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **HeroUI** for UI components
- **Framer Motion** for animations
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn
- PM2 (for production)
- Nginx (for production reverse proxy)

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE merchandise;
```

2. Import the database schema:
```sql
-- Users table
CREATE TABLE users (
  user_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  category_name VARCHAR(100) PRIMARY KEY,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  order_id CHAR(6) PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Order items table
CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id CHAR(6) NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Cart table
CREATE TABLE cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payments table
CREATE TABLE payments (
  payment_id INT PRIMARY KEY,
  order_id CHAR(6) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('upi') NOT NULL,
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  transaction_ref VARCHAR(50),
  paid_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Notifications table
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('refund_request', 'order_update', 'admin_message', 'cancellation_request') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  order_id CHAR(6),
  user_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Backend Setup
1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=merchandise
DB_PORT=3306
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🚀 Production Deployment

### Quick Deploy
```bash
./deploy.sh
```

### Manual Production Setup
1. Install all dependencies:
```bash
npm run install:all
```

2. Build frontend:
```bash
npm run build
```

3. Configure production environment:
```bash
cp .env.production .env
# Edit .env with your production values
```

4. Start production server:
```bash
npm start
# Or with PM2:
pm2 start ecosystem.config.js
```

### Nginx Configuration
Copy `nginx.conf` to your nginx sites and update paths/domain.

## 🔧 Configuration

### Admin Access
- **Username**: admin
- **Password**: jamesbond001

### UPI Payment Configuration
- Update UPI ID in `/backend/routes/orders.js`
- Modify payment gateway integration as needed

## 📱 Usage

1. **Customer Registration**: Create account with email and phone
2. **Browse Products**: View products by categories or search
3. **Add to Cart**: Select products with quantity controls
4. **Checkout**: Place order with UPI payment
5. **Track Orders**: Monitor order status and history
6. **Admin Panel**: Access at `/admin` with admin credentials

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HeroUI** for the beautiful UI components
- **Framer Motion** for smooth animations
- **React** team for the amazing framework
- **Node.js** community for the robust backend platform

## 📞 Support

For support, email support@ogmerchandise.com or create an issue in this repository.

---

**Built with ❤️ for "They Call Him OG" movie fans**