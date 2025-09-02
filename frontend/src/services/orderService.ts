import { API_BASE_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const orderService = {
  placeOrder: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to place order');
    return response.json();
  },

  getUserOrders: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  requestCancellation: async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel-request`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to request cancellation');
    return response.json();
  },

  requestRefund: async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/refund-request`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to request refund');
    return response.json();
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/notifications`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  markNotificationRead: async (notificationId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  sendMessageToCustomer: async (userId: number, title: string, message: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/send-message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, title, message })
    });
    
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  getCustomerNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/notifications`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  markCustomerNotificationRead: async (notificationId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  approveCancellation: async (notificationId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/cancellation/${notificationId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to approve cancellation');
    return response.json();
  },

  declineCancellation: async (notificationId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/cancellation/${notificationId}/decline`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to decline cancellation');
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/users`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }
};