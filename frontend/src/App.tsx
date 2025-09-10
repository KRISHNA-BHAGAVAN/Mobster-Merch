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
import SiteClosedPage from './pages/SiteClosedPage';
import { theme } from './theme/muiTheme';
import { CollectionsPage } from "./pages/CollectionsPage";
import { Home } from "./pages/Home";
import { Footer } from "./pages/Footer";
import {Promotions} from "./pages/Promotions";
import { FeaturedMerchandisePage } from './pages/FeaturedMerchandisePage';

// Lazy load components
const Login = lazy(() => import('./components/Login').then(m => ({ default: m.Login })));
const MainWebsite = lazy(() => import('./components/MainWebsite').then(m => ({ default: m.MainWebsite })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AllProducts = lazy(() => import('./pages/AllProducts').then(m => ({ default: m.AllProducts })));
const CategoryProducts = lazy(() => import('./pages/CategoryProducts').then(m => ({ default: m.CategoryProducts })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));

const CustomerNotifications = lazy(() => import('./components/CustomerNotifications').then(m => ({ default: m.CustomerNotifications })));
const ProductDetailedPage = lazy(() => import("./pages/ProductDetailedPage").then(m => ({ default: m.ProductDetails })));
const CheckoutPage = lazy(() => import("./components/Checkout/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const OrdersPage = lazy(() => import("./components/Orders/OrdersPage").then(m => ({ default: m.OrdersPage })));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const TermsAndConditions = lazy(() => import('./pages/AboutPages/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })));
const PrivacyPolicy = lazy(() => import('./pages/AboutPages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const ReturnPolicy = lazy(() => import('./pages/AboutPages/ReturnPolicy').then(m => ({ default: m.ReturnPolicy })));
const ShippingPolicy = lazy(() => import('./pages/AboutPages/ShippingPolicy').then(m => ({ default: m.ShippingPolicy })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FloatingCart = lazy(() => import('./components/FloatingCart').then(m => ({ default: m.FloatingCart })));

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
                        element={<Login siteClosed={siteClosed} />}
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
                      <Route path="/home" element={<MainWebsite />} />
                      {/* <Route path="/home" element={<Home />} /> */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/promotions" element={<Promotions />} />
                      <Route path="/products" element={<AllProducts />} />
                      <Route path="/product/:id" element={<ProductDetailedPage />} />
                      <Route
                        path="/category/:category"
                        element={<CategoryProducts />}
                      />
                      <Route
                        path="/T&C"
                        element={<TermsAndConditions showNavbar={true}/>}
                      />
                      <Route
                        path="/privacy_policy"
                        element={<PrivacyPolicy showNavbar={true}/>}
                      />
                      <Route path="/refund_policy" element={<ReturnPolicy showNavbar={true}/>} />
                      <Route path="/shipping_policy" element={<ShippingPolicy showNavbar={true}/>} />
                      <Route path="/collections" element={<CollectionsPage showNavbar={true}/>} />
                      <Route path='/featured-merchandise' element={<FeaturedMerchandisePage/>}/>

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
                        path="/payment-success"
                        element={
                          <ProtectedRoute>
                            <PaymentSuccess />
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
                <FloatingCart />
              </Suspense>
            </Router>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
