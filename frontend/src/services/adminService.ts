import { API_BASE_URL } from './index';

export interface Order {
  order_id: string;
  user_id: number;
  user_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
  items: string;
}

export interface PendingPayment {
  payment_id: number;
  order_id: string;
  amount: number;
  transaction_ref?: string;
  status: string;
  created_at: string;
  user_id: number;
  user_name: string;
}

export interface DailySales {
  date: string;
  total_orders: number;
  total_revenue: number;
}

export interface ReportsData {
  dailySales: DailySales[];
  failedPaymentsCount: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const adminService = {
  // Orders Management
  getAllOrders: async (status?: string): Promise<Order[]> => {
    const url = status 
      ? `${API_BASE_URL}/orders/admin/all?status=${status}`
      : `${API_BASE_URL}/orders/admin/all`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
  },

  // Payments Management
  getPendingPayments: async (): Promise<PendingPayment[]> => {
    const response = await fetch(`${API_BASE_URL}/payments/pending`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch pending payments');
    return response.json();
  },

  markPaymentComplete: async (paymentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/mark-complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to mark payment as complete');
  },

  // Reports
  getDailyReports: async (): Promise<ReportsData> => {
    const response = await fetch(`${API_BASE_URL}/orders/admin/reports/daily`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  }
};