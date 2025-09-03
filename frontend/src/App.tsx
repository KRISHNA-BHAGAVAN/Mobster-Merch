import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load components
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const MainWebsite = lazy(() => import('./components/MainWebsite').then(m => ({ default: m.MainWebsite })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AllProducts = lazy(() => import('./components/AllProducts').then(m => ({ default: m.AllProducts })));
const CategoryProducts = lazy(() => import('./components/CategoryProducts').then(m => ({ default: m.CategoryProducts })));
const Cart = lazy(() => import('./components/Cart').then(m => ({ default: m.Cart })));
const Orders = lazy(() => import('./components/Orders').then(m => ({ default: m.Orders })));
const CustomerNotifications = lazy(() => import('./components/CustomerNotifications').then(m => ({ default: m.CustomerNotifications })));

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
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
            </Suspense>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;