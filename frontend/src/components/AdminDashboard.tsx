import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productService, categoryService, API_BASE_URL, Category } from '../services';
import { adminService, Order, PendingPayment, ReportsData } from '../services/adminService';
import { orderService } from '../services/orderService';
import { settingsService } from '../services/settingsService';
import '../styles/admin.css';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}

interface Notification {
  notification_id: number;
  type: string;
  title: string;
  message: string;
  order_id?: string;
  user_id?: number;
  is_read: boolean;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [unavailableProducts, setUnavailableProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ user_id: '', title: '', message: '' });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [websiteOpen, setWebsiteOpen] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [productSubTab, setProductSubTab] = useState('available');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
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
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'payments') {
      fetchPendingPayments();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, orderStatusFilter]);

  useEffect(() => {
    if (activeTab === 'products') {
      if (productSubTab === 'available') {
        fetchAvailableProducts();
      } else {
        fetchUnavailableProducts();
      }
    }
  }, [productSubTab]);

  useEffect(() => {
    fetchWebsiteStatus();
  }, []);

  const fetchWebsiteStatus = async () => {
    try {
      const data = await settingsService.getWebsiteStatus();
      setWebsiteOpen(data.isOpen);
    } catch (error) {
      console.error('Error fetching website status:', error);
    }
  };

  const toggleWebsiteStatus = async () => {
    try {
      const newStatus = !websiteOpen;
      await settingsService.toggleWebsiteStatus(newStatus);
      setWebsiteOpen(newStatus);
      toast.success(`Website ${newStatus ? 'opened' : 'closed'} successfully! ${!newStatus ? 'Refresh any open tabs to see maintenance mode.' : ''}`);
    } catch (error) {
      toast.error('Error updating website status');
    }
  };

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

  const markAsRead = async (notificationId: number) => {
    try {
      await orderService.markNotificationRead(notificationId);
      fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  const handleApproveCancellation = async (notificationId: number) => {
    try {
      await orderService.approveCancellation(notificationId);
      fetchNotifications();
      toast.success('Cancellation approved successfully');
    } catch (error) {
      toast.error('Error approving cancellation');
    }
  };

  const handleDeclineCancellation = async (notificationId: number) => {
    try {
      await orderService.declineCancellation(notificationId);
      fetchNotifications();
      toast.success('Cancellation declined successfully');
    } catch (error) {
      toast.error('Error declining cancellation');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await orderService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      await orderService.sendMessageToCustomer(
        parseInt(messageForm.user_id),
        messageForm.title,
        messageForm.message
      );
      toast.success('Message sent successfully!');
      setShowMessageModal(false);
      setMessageForm({ user_id: '', title: '', message: '' });
    } catch (error) {
      toast.error('Error sending message');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    const categoryObject = categories.find(cat => cat.name === formData.category);
    if (categoryObject) {
      formDataToSend.append('category_id', categoryObject.category_id.toString());
    } else {
      toast.error('Invalid category selected');
      return;
    }

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.product_id, formDataToSend);
      } else {
        await productService.createProduct(formDataToSend);
      }
      
      fetchProducts();
      resetForm();
      toast.success(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleSoftDelete = async (id: number) => {
    showConfirmation(
      'Are you sure you want to stop displaying this product? It will be moved to the "Not Available" list.',
      async () => {
        try {
          await productService.deleteProduct(id);
          fetchProducts();
          toast.success('Product soft-deleted successfully!');
        } catch (error) {
          toast.error('Error soft-deleting product');
        }
      }
    );
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '' });
    setImageFile(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '', description: '', image_url: '' });
    setCategoryImageFile(null);
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    formDataToSend.append('name', categoryFormData.name);
    formDataToSend.append('description', categoryFormData.description);
    
    if (categoryImageFile) {
      formDataToSend.append('image', categoryImageFile);
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategoryWithImage(editingCategory.category_name, formDataToSend);
      } else {
        await categoryService.createCategoryWithImage(formDataToSend);
      }
      
      fetchCategories();
      resetCategoryForm();
      toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (error) {
      toast.error(error.message || 'Error saving category');
    }
  };

  const handleCategoryDelete = async (categoryName: string) => {
    showConfirmation(
      'Are you sure you want to delete this category?',
      async () => {
        try {
          await categoryService.deleteCategory(categoryName);
          fetchCategories();
          toast.success('Category deleted successfully!');
        } catch (error) {
          toast.error(error.message || 'Error deleting category');
        }
      }
    );
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.category_name,
      description: category.description || '',
      image_url: category.image_url || ''
    });
    setShowCategoryForm(true);
  };
  
  const handleRestoreProduct = async (id: number) => {
    showConfirmation(
      'Are you sure you want to restore this product?',
      async () => {
        try {
          await productService.restoreProduct(id);
          fetchProducts();
          toast.success('Product restored successfully!');
        } catch (error) {
          toast.error('Error restoring product');
        }
      }
    );
  };

  const handlePermanentDelete = async (id: number) => {
    showConfirmation(
      'Are you sure you want to permanently delete this product?',
      async () => {
        try {
          await adminService.deleteProductPermanently(id);
          fetchProducts();
          toast.success('Product permanently deleted!');
        } catch (error) {
          toast.error('Error permanently deleting product');
        }
      }
    );
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
              onClick={toggleWebsiteStatus}
              className={`flex items-center gap-2 py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${
                websiteOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" x2="12" y1="2" y2="12"/>
              </svg>
              {websiteOpen ? 'Close Website' : 'Open Website'}
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'products') setShowAddForm(!showAddForm);
                else if (activeTab === 'categories') setShowCategoryForm(!showCategoryForm);
                else if (activeTab === 'notifications') {
                  fetchAllUsers();
                  setShowMessageModal(true);
                }
              }}
              className="flex items-center gap-2 py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
              {activeTab === 'products' ? 'Add Product' : 
               activeTab === 'categories' ? 'Add Category' : 
               activeTab === 'notifications' ? 'Send Message' : 'Add'}
            </button>
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

        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <input
                    placeholder="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  rows={3}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                />
                <div className="flex gap-4">
                  <button type="submit" className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={resetForm} className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-b border-gray-700 mb-6">
          <div className="flex flex-wrap space-x-4">
            {['products', 'categories', 'orders', 'payments', 'reports', 'notifications'].map(tab => (
              <button
                key={tab}
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
          {activeTab === 'products' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => setProductSubTab('available')}
                  className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${productSubTab === 'available' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  Available Products
                </button>
                <button
                  onClick={() => setProductSubTab('unavailable')}
                  className={`py-2 px-4 rounded-full font-semibold transition-colors duration-200 ${productSubTab === 'unavailable' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  Not Available Products
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productSubTab === 'available' && products.map(product => (
                  <motion.div
                    key={product.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700"
                  >
                    {product.image_url && (
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${product.image_url}`}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mb-4 text-sm font-mono text-red-400">
                      <span>₹{product.price}</span>
                      <span className="text-gray-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="flex-1 py-2 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleSoftDelete(product.product_id)}
                        className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
                {productSubTab === 'unavailable' && unavailableProducts.map(product => (
                  <motion.div
                    key={product.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700 opacity-70"
                  >
                    {product.image_url && (
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${product.image_url}`}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4 opacity-50"
                      />
                    )}
                    <h3 className="text-lg font-bold text-white mb-1 line-through">{product.name}</h3>
                    <p className="text-sm text-gray-400 mb-2 truncate">{product.description}</p>
                    <div className="flex justify-between items-center mb-4 text-sm font-mono text-red-400">
                      <span>₹{product.price}</span>
                      <span className="text-gray-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRestoreProduct(product.product_id)}
                        className="flex-1 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(product.product_id)}
                        className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                      >
                        Permanent Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              {showCategoryForm && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700"
                >
                  <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <input
                      placeholder="Category Name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      required
                    />
                    <textarea
                      placeholder="Description (Optional)"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      rows={3}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                    />
                    <div className="flex gap-4">
                      <button type="submit" className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200">
                        {editingCategory ? 'Update Category' : 'Add Category'}
                      </button>
                      <button type="button" onClick={resetCategoryForm} className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200">
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <div key={category.category_name} className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-1">{category.category_name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{category.description || 'No description'}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCategoryEdit(category)}
                        className="flex-1 py-2 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleCategoryDelete(category.category_name)}
                        className="flex-1 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="mb-4">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full sm:w-auto p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.order_id} className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Order #{order.order_id}</h3>
                        <p className="text-sm text-gray-400">{order.user_name} ({order.email})</p>
                        <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <p className="text-xl font-mono text-red-500">₹{order.total}</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'paid' ? 'bg-green-600 text-white' :
                          order.status === 'shipped' ? 'bg-yellow-600 text-white' :
                          order.status === 'delivered' ? 'bg-blue-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4"><strong>Items:</strong> {order.items}</p>
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={(e) => handleOrderStatusUpdate(order.order_id, e.target.value)}
                        className="flex-1 p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="">Change Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="space-y-4">
                {pendingPayments.map(payment => (
                  <div key={payment.payment_id} className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Payment #{payment.payment_id}</h3>
                        <p className="text-sm text-gray-400">Order: {payment.order_id}</p>
                        <p className="text-sm text-gray-400">{payment.user_name}</p>
                        <p className="text-sm text-gray-400">{new Date(payment.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right mt-2 sm:mt-0">
                        <p className="text-xl font-mono text-red-500">₹{payment.amount}</p>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600 text-white">
                          PENDING
                        </span>
                      </div>
                    </div>
                    
                    {payment.transaction_ref && (
                      <p className="text-sm text-gray-300 mb-4"><strong>Transaction Ref:</strong> {payment.transaction_ref}</p>
                    )}
                    
                    <button 
                      onClick={() => handleMarkPaymentComplete(payment.payment_id)}
                      className="py-2 px-6 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                      Mark as Completed
                    </button>
                  </div>
                ))}
                
                {pendingPayments.length === 0 && (
                  <div key="no-pending-payments-key" className="text-center py-8 text-gray-400">
                    <p>No pending payments</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              {reports && (
                <div className="space-y-6">
                  <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-950 rounded-lg border border-green-800">
                        <p className="text-2xl font-mono text-green-400">
                          ₹{reports.dailySales.reduce((sum, day) => sum + day.total_revenue, 0)}
                        </p>
                        <p className="text-sm text-gray-400">Total Revenue (30 days)</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-950 rounded-lg border border-yellow-800">
                        <p className="text-2xl font-mono text-yellow-400">{reports.failedPaymentsCount}</p>
                        <p className="text-sm text-gray-400">Failed/Pending Payments</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Daily Sales (Last 30 Days)</h3>
                    <div className="space-y-2">
                      {reports.dailySales.map(day => (
                        <div key={day.date} className="flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
                          <span className="text-sm text-gray-300">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="text-right">
                            <span className="font-mono text-red-500">₹{day.total_revenue}</span>
                            <span className="text-sm text-gray-400 ml-2">({day.total_orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.notification_id} className={`p-4 rounded-xl shadow-md transition-all duration-200 ${!notification.is_read ? 'bg-red-950 border border-red-800' : 'bg-gray-900 border border-gray-700'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`mt-2 sm:mt-0 px-2 py-1 rounded-full text-xs font-semibold ${
                          notification.type === 'refund_request' ? 'bg-yellow-600 text-white' :
                          notification.type === 'cancellation_request' ? 'bg-red-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {notification.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{notification.message}</p>
                    
                    {notification.order_id && (
                      <p className="text-sm text-gray-500 mb-4">
                        <strong>Order ID:</strong> {notification.order_id}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {notification.type === 'cancellation_request' && !notification.is_read && (
                        <>
                          <button 
                            onClick={() => handleApproveCancellation(notification.notification_id)}
                            className="py-2 px-4 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleDeclineCancellation(notification.notification_id)}
                            className="py-2 px-4 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {!notification.is_read && notification.type !== 'cancellation_request' && (
                        <button 
                          onClick={() => markAsRead(notification.notification_id)}
                          className="py-2 px-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div key="no-notifications-card" className="text-center py-8 text-gray-400">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {showMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="w-full max-w-lg bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Send Message to Customer</h2>
                  <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <select
                    value={messageForm.user_id}
                    onChange={(e) => setMessageForm({...messageForm, user_id: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {allUsers.map(user => (
                      <option key={user.user_id.toString()} value={user.user_id.toString()}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Message Title"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <textarea
                    placeholder="Message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowMessageModal(false)} className="py-2 px-6 rounded-full border border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors duration-200">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageForm.user_id || !messageForm.title || !messageForm.message}
                    className="py-2 px-6 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
