import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Textarea, Select, SelectItem, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Autocomplete, AutocompleteItem } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { productService, categoryService, API_BASE_URL, Category } from '../services';
import { adminService, Order, PendingPayment, ReportsData } from '../services/adminService';
import { orderService } from '../services/orderService';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ user_id: '', title: '', message: '' });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('products');
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
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'payments') fetchPendingPayments();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'notifications') fetchNotifications();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAdminProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await adminService.getAllOrders(orderStatusFilter || undefined);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const data = await adminService.getPendingPayments();
      setPendingPayments(data);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await adminService.getDailyReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await orderService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await orderService.markNotificationRead(notificationId);
      fetchNotifications();
      showToast('Notification marked as read', 'success');
    } catch (error) {
      showToast('Error marking notification as read', 'error');
    }
  };

  const handleApproveCancellation = async (notificationId: number) => {
    try {
      await orderService.approveCancellation(notificationId);
      fetchNotifications();
      showToast('Cancellation approved successfully', 'success');
    } catch (error) {
      showToast('Error approving cancellation', 'error');
    }
  };

  const handleDeclineCancellation = async (notificationId: number) => {
    try {
      await orderService.declineCancellation(notificationId);
      fetchNotifications();
      showToast('Cancellation declined successfully', 'success');
    } catch (error) {
      showToast('Error declining cancellation', 'error');
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
      showToast('Message sent successfully!', 'success');
      setShowMessageModal(false);
      setMessageForm({ user_id: '', title: '', message: '' });
    } catch (error) {
      showToast('Error sending message', 'error');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      fetchOrders();
      showToast('Order status updated!', 'success');
    } catch (error) {
      showToast('Error updating order status', 'error');
    }
  };

  const handleMarkPaymentComplete = async (paymentId: number) => {
    try {
      await adminService.markPaymentComplete(paymentId);
      fetchPendingPayments();
      showToast('Payment marked as completed!', 'success');
    } catch (error) {
      showToast('Error marking payment as complete', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
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
      showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success');
    } catch (error) {
      showToast('Error saving product', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await productService.deleteProduct(id);
      fetchProducts();
      showToast('Product deleted successfully!', 'success');
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
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
      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error saving category', 'error');
    }
  };

  const handleCategoryDelete = async (categoryName: string) => {
    if (!confirm('Delete this category?')) return;
    
    try {
      await categoryService.deleteCategory(categoryName);
      fetchCategories();
      showToast('Category deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error deleting category', 'error');
    }
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

  return (
    <div className="admin-page min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="heading-font text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-foreground/70 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              onPress={() => {
                if (activeTab === 'products') setShowAddForm(!showAddForm);
                else if (activeTab === 'categories') setShowCategoryForm(!showCategoryForm);
                else if (activeTab === 'notifications') {
                  fetchAllUsers();
                  setShowMessageModal(true);
                }
              }}
              startContent={<Icon icon="lucide:plus" />}
            >
              {activeTab === 'products' ? 'Add Product' : 
               activeTab === 'categories' ? 'Add Category' : 
               activeTab === 'notifications' ? 'Send Message' : 'Add'}
            </Button>
            <Button 
              color="danger" 
              variant="flat"
              onPress={handleLogout}
              startContent={<Icon icon="lucide:log-out" />}
            >
              Logout
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardBody>
              <h2 className="heading-font text-xl mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                  />
                  <Select
                    label="Category"
                    selectedKeys={formData.category ? [formData.category] : []}
                    onSelectionChange={(keys) => setFormData({...formData, category: Array.from(keys)[0] as string})}
                  >
                    {categories.map(cat => (
                      <SelectItem key={cat.category_name} value={cat.category_name}>{cat.category_name}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <div className="flex gap-2">
                  <Button type="submit" color="primary">
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                  <Button variant="flat" onPress={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <Tabs aria-label="Admin Options" color="primary" onSelectionChange={(key) => setActiveTab(key as string)}>
          <Tab key="products" title="Products">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.product_id}>
                  <CardBody>
                    {product.image_url && (
                      <img 
                        src={`${API_BASE_URL.replace('/api', '')}${product.image_url}`}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <h3 className="heading-font text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-foreground/70 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-mono text-primary">₹{product.price}</span>
                      <span className="text-sm">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="flat"
                        onPress={() => handleEdit(product)}
                        startContent={<Icon icon="lucide:edit" />}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        color="danger" 
                        variant="flat"
                        onPress={() => handleDelete(product.product_id)}
                        startContent={<Icon icon="lucide:trash" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>
          
          <Tab key="categories" title="Categories">
            {showCategoryForm && (
              <Card className="mb-6">
                <CardBody>
                  <h2 className="heading-font text-xl mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <Input
                      label="Category Name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                      required
                    />
                    <Textarea
                      label="Description (Optional)"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      label="Category Image (Optional)"
                      onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" color="primary">
                        {editingCategory ? 'Update' : 'Add'} Category
                      </Button>
                      <Button variant="flat" onPress={resetCategoryForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card key={category.category_name}>
                  <CardBody>
                    <h3 className="heading-font text-lg mb-2">{category.category_name}</h3>
                    <p className="text-sm text-foreground/70 mb-4">{category.description || 'No description'}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="flat"
                        onPress={() => handleCategoryEdit(category)}
                        startContent={<Icon icon="lucide:edit" />}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        color="danger" 
                        variant="flat"
                        onPress={() => handleCategoryDelete(category.category_name)}
                        startContent={<Icon icon="lucide:trash" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>
          
          <Tab key="orders" title="Orders">
            <div className="mb-4">
              <Select
                label="Filter by Status"
                placeholder="All Orders"
                selectedKeys={orderStatusFilter ? [orderStatusFilter] : []}
                onSelectionChange={(keys) => {
                  const status = Array.from(keys)[0] as string;
                  setOrderStatusFilter(status);
                  fetchOrders();
                }}
                className="max-w-xs"
              >
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="paid" value="paid">Paid</SelectItem>
                <SelectItem key="shipped" value="shipped">Shipped</SelectItem>
                <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
              </Select>
            </div>
            
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.order_id}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="heading-font text-lg">Order #{order.order_id}</h3>
                        <p className="text-sm text-foreground/70">{order.user_name} ({order.email})</p>
                        <p className="text-sm text-foreground/70">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-primary text-lg">₹{order.total}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'paid' ? 'bg-success/20 text-success' :
                          order.status === 'shipped' ? 'bg-warning/20 text-warning' :
                          order.status === 'delivered' ? 'bg-primary/20 text-primary' :
                          'bg-default/20 text-default-foreground'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4"><strong>Items:</strong> {order.items}</p>
                    
                    <div className="flex gap-2">
                      <Select
                        placeholder="Change Status"
                        onSelectionChange={(keys) => {
                          const status = Array.from(keys)[0] as string;
                          if (status) handleOrderStatusUpdate(order.order_id, status);
                        }}
                        className="max-w-xs"
                      >
                        <SelectItem key="pending" value="pending">Pending</SelectItem>
                        <SelectItem key="paid" value="paid">Paid</SelectItem>
                        <SelectItem key="shipped" value="shipped">Shipped</SelectItem>
                        <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
                      </Select>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>
          
          <Tab key="payments" title="Payments">
            <div className="space-y-4">
              {pendingPayments.map(payment => (
                <Card key={payment.payment_id}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="heading-font text-lg">Payment #{payment.payment_id}</h3>
                        <p className="text-sm text-foreground/70">Order: {payment.order_id}</p>
                        <p className="text-sm text-foreground/70">{payment.user_name}</p>
                        <p className="text-sm text-foreground/70">{new Date(payment.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-primary text-lg">₹{payment.amount}</p>
                        <span className="px-2 py-1 rounded text-xs bg-warning/20 text-warning">
                          PENDING
                        </span>
                      </div>
                    </div>
                    
                    {payment.transaction_ref && (
                      <p className="text-sm mb-4"><strong>Transaction Ref:</strong> {payment.transaction_ref}</p>
                    )}
                    
                    <Button 
                      color="success"
                      onPress={() => handleMarkPaymentComplete(payment.payment_id)}
                      startContent={<Icon icon="lucide:check" />}
                    >
                      Mark as Completed
                    </Button>
                  </CardBody>
                </Card>
              ))}
              
              {pendingPayments.length === 0 && (
                <Card>
                  <CardBody className="text-center py-8">
                    <p className="text-foreground/70">No pending payments</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>
          
          <Tab key="reports" title="Reports">
            {reports && (
              <div className="space-y-6">
                <Card>
                  <CardBody>
                    <h3 className="heading-font text-xl mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-success/10 rounded">
                        <p className="text-2xl font-mono text-success">
                          ₹{reports.dailySales.reduce((sum, day) => sum + day.total_revenue, 0)}
                        </p>
                        <p className="text-sm text-foreground/70">Total Revenue (30 days)</p>
                      </div>
                      <div className="text-center p-4 bg-warning/10 rounded">
                        <p className="text-2xl font-mono text-warning">{reports.failedPaymentsCount}</p>
                        <p className="text-sm text-foreground/70">Failed/Pending Payments</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                
                <Card>
                  <CardBody>
                    <h3 className="heading-font text-xl mb-4">Daily Sales (Last 30 Days)</h3>
                    <div className="space-y-2">
                      {reports.dailySales.map(day => (
                        <div key={day.date} className="flex justify-between items-center p-3 bg-default/5 rounded">
                          <span>{new Date(day.date).toLocaleDateString()}</span>
                          <div className="text-right">
                            <span className="font-mono text-primary">₹{day.total_revenue}</span>
                            <span className="text-sm text-foreground/70 ml-2">({day.total_orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </Tab>
          
          <Tab key="notifications" title="Notifications">
            <div className="space-y-4">
              {notifications.map(notification => (
                <Card key={notification.notification_id} className={!notification.is_read ? 'border-primary' : ''}>
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="heading-font text-lg flex items-center gap-2">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-foreground/70">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.type === 'refund_request' ? 'bg-warning/20 text-warning' :
                          notification.type === 'cancellation_request' ? 'bg-danger/20 text-danger' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mb-4">{notification.message}</p>
                    
                    {notification.order_id && (
                      <p className="text-sm text-foreground/60 mb-4">
                        <strong>Order ID:</strong> {notification.order_id}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {notification.type === 'cancellation_request' && !notification.is_read && (
                        <>
                          <Button 
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleApproveCancellation(notification.notification_id)}
                            startContent={<Icon icon="lucide:check" />}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleDeclineCancellation(notification.notification_id)}
                            startContent={<Icon icon="lucide:x" />}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {!notification.is_read && notification.type !== 'cancellation_request' && (
                        <Button 
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => markAsRead(notification.notification_id)}
                          startContent={<Icon icon="lucide:check" />}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
              
              {notifications.length === 0 && (
                <Card>
                  <CardBody className="text-center py-8">
                    <Icon icon="lucide:bell" className="h-12 w-12 text-foreground/50 mx-auto mb-4" />
                    <p className="text-foreground/70">No notifications</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>
        </Tabs>
        
        <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} size="lg">
          <ModalContent>
            <ModalHeader>Send Message to Customer</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Autocomplete
                  label="Select Customer"
                  placeholder="Search and select a customer"
                  selectedKey={messageForm.user_id}
                  onSelectionChange={(key) => setMessageForm({...messageForm, user_id: key as string})}
                  allowsCustomValue={false}
                >
                  {allUsers.map(user => (
                    <AutocompleteItem key={user.user_id.toString()} value={user.user_id.toString()}>
                      {user.name} ({user.email})
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                
                <Input
                  label="Message Title"
                  value={messageForm.title}
                  onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                  required
                />
                
                <Textarea
                  label="Message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}
                  rows={4}
                  required
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSendMessage}
                isDisabled={!messageForm.user_id || !messageForm.title || !messageForm.message}
              >
                Send Message
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};