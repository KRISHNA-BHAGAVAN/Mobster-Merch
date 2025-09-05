import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productService, categoryService, Category } from '../../services';
import { adminService, Order, PendingPayment, ReportsData } from '../../services/adminService';
import { orderService } from '../../services/orderService';

import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { OrdersTab } from './OrdersTab';
import { Product, Notification } from './types';
import '../../styles/admin.css';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [unavailableProducts, setUnavailableProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ user_id: '', title: '', message: '' });
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState('products');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => {
      return () => {
        action();
        setShowConfirmModal(false);
      };
    });
    setShowConfirmModal(true);
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'payments') {
      fetchPendingPayments();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, orderStatusFilter]);



  const fetchAvailableProducts = async () => {
    try {
      const data = await productService.getAvailableProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available products:', error);
      setProducts([]);
    }
  };

  const fetchUnavailableProducts = async () => {
    try {
      const data = await productService.getUnavailableProducts();
      setUnavailableProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching unavailable products:', error);
      setUnavailableProducts([]);
    }
  };

  const fetchProducts = () => {
    fetchAvailableProducts();
    fetchUnavailableProducts();
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await adminService.getAllOrders(orderStatusFilter || undefined);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const data = await adminService.getPendingPayments();
      setPendingPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setPendingPayments([]);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await adminService.getDailyReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await orderService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings/analytics`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      fetchOrders();
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Error updating order status');
    }
  };

  const handleMarkPaymentComplete = async (paymentId: number) => {
    try {
      await adminService.markPaymentComplete(paymentId);
      fetchPendingPayments();
      toast.success('Payment marked as completed!');
    } catch (error) {
      toast.error('Error marking payment as complete');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <ProductsTab
            products={products}
            unavailableProducts={unavailableProducts}
            categories={categories}
            fetchProducts={fetchProducts}
            showConfirmation={showConfirmation}
          />
        );
      case 'categories':
        return (
          <CategoriesTab
            categories={categories}
            fetchCategories={fetchCategories}
            showConfirmation={showConfirmation}
          />
        );
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            handleOrderStatusUpdate={handleOrderStatusUpdate}
          />
        );
      default:
        return <div className="text-center py-8 text-gray-400">Tab content not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold tracking-wide text-red-500">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 px-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="border-b border-gray-700 mb-6">
          <div className="flex flex-wrap space-x-4">
            {['products', 'categories', 'orders', 'payments', 'reports', 'notifications', 'analytics'].map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 text-sm font-medium capitalize border-b-2 transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          {renderTabContent()}
        </div>

        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="w-full max-w-sm bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 relative text-center"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4 text-white">Confirmation</h2>
                <p className="text-gray-300 mb-6">{confirmMessage}</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmAction}
                    className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};