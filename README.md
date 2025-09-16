# OG Merchandise

A full-stack e-commerce platform for merchandise with React frontend and Node.js backend.

## Features

- **Product Management**: Browse, search, and view detailed product information with variants
- **User Authentication**: Secure login/register with email verification
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products
- **Order Management**: Complete checkout process with payment integration
- **Admin Dashboard**: Manage products, categories, orders, and analytics
- **Payment Integration**: PhonePe payment gateway
- **Image Management**: Cloudinary integration for image uploads
- **Email Service**: Automated email notifications

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Material-UI** components
- **Framer Motion** for animations
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MySQL** database
- **Redis** for session management
- **Cloudinary** for image storage
- **PhonePe SDK** for payments
- **Nodemailer** for emails
- **JWT** for authentication

## Project Structure

```
og_merchandise/
├── frontend/           # React frontend application
├── backend/           # Node.js backend API
├── package.json       # Root dependencies
└── README.md         # This file
```

## Installation

### Prerequisites
- Node.js (v16+)
- MySQL
- Redis
- Cloudinary account
- PhonePe merchant account

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd og_merchandise
```

2. **Install root dependencies**
```bash
npm install
```

3. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
SESSION_SECRET=your_session_secret
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=merchandise
DB_HOST=localhost
DB_PORT=3306
NODE_ENV=development
PORT=5000

PHONEPE_CLIENT_ID=your_phonepe_client_id
PHONEPE_CLIENT_SECRET=your_phonepe_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=Env.SANDBOX

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Your Name <your_email@gmail.com>
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env.development` file in frontend directory:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_UPLOAD_URL="http://localhost:5000"
```

5. **Database Setup**
```bash
# Import the database schema
mysql -u your_username -p merchandise < merchandise.sql
```

## Running the Application

### Development Mode

1. **Start Backend**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Start Backend**
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-email/:token` - Email verification

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove cart item

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/:id` - Remove from wishlist

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/checkout` - Create order
- `GET /api/orders/:id` - Get order details

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Secret for session encryption |
| `DB_*` | Database connection details |
| `PHONEPE_*` | PhonePe payment gateway credentials |
| `CLOUDINARY_*` | Cloudinary image storage credentials |
| `EMAIL_*` | Email service configuration |

### Frontend (.env.development)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_UPLOAD_URL` | File upload base URL |

## Deployment

1. **Build the frontend**
```bash
cd frontend
npm run build
```

2. **Deploy using PM2**
```bash
pm2 start ecosystem.config.js
```

3. **Setup Nginx** (optional)
Configure Nginx to serve the frontend and proxy API requests to the backend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.