import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { Login } from './components/Login';
import { MainWebsite } from './components/MainWebsite';
import { AdminDashboard } from './components/AdminDashboard';
import { AllProducts } from './components/AllProducts';
import { CategoryProducts } from './components/CategoryProducts';
import { Cart } from './components/Cart';
import { Orders } from './components/Orders';
import { CustomerNotifications } from './components/CustomerNotifications';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainWebsite />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/category/:category" element={<CategoryProducts />} />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <CustomerNotifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;