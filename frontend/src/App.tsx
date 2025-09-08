import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPageProtection } from './components/AuthPageProtection';
import { API_BASE_URL } from './config/api';
import SiteClosedPage from './components/SiteClosedPage';
import { theme } from './theme/muiTheme';

// Lazy load components
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const MainWebsite = lazy(() => import('./components/MainWebsite').then(m => ({ default: m.MainWebsite })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AllProducts = lazy(() => import('./components/AllProducts').then(m => ({ default: m.AllProducts })));
const CategoryProducts = lazy(() => import('./components/CategoryProducts').then(m => ({ default: m.CategoryProducts })));
const Cart = lazy(() => import('./components/Cart').then(m => ({ default: m.Cart })));
const Orders = lazy(() => import('./components/Orders').then(m => ({ default: m.Orders })));
const CustomerNotifications = lazy(() => import('./components/CustomerNotifications').then(m => ({ default: m.CustomerNotifications })));
const ProductDetails = lazy(() => import("./components/ProductDetails").then(m => ({ default: m.ProductDetails })));
const CheckoutPage = lazy(() => import("./components/Checkout/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const OrdersPage = lazy(() => import("./components/Orders/OrdersPage").then(m => ({ default: m.OrdersPage })));
const TermsAndConditions = lazy(() => import('./components/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./components/RefundPolicy').then(m => ({ default: m.RefundPolicy })));

function App() {
  const [siteClosed, setSiteClosed] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/site-status`)
      .then(res => res.json())
      .then(data => {
        setSiteClosed(data.closed);
        setLoadingStatus(false);
      })
      .catch(() => {
        setSiteClosed(false);
        setLoadingStatus(false);
      });
  }, []);

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Routes>
                  {siteClosed ? (
                    <>
                      <Route path="*" element={<SiteClosedPage />} />
                      <Route
                        path="/login"
                        element={
                          <Login siteClosed={siteClosed} /> 
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
                    </>
                  ) : (

                    <>
                      <Route
                        path="/login"
                        element={
                          <AuthPageProtection>
                            <Login />
                          </AuthPageProtection>
                        }
                      />
                      <Route path="/" element={<MainWebsite />} />
                      <Route path="/products" element={<AllProducts />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/category/:category" element={<CategoryProducts />} />
                      <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
                      <Route path="/privacy_policy" element={<PrivacyPolicy />} />
                      <Route path="/refund_policy" element={<RefundPolicy />} />

                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
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
                    </>
                  )}
                </Routes>
              </Suspense>
            </Router>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
