import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL, UPLOAD_BASE_URL } from '../../config/api';

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
  isAdmin?: boolean;
}

interface OrderDetails {
  order: {
    order_id: string;
    total: number;
    status: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    pincode: string;
    transaction_id: string;
    screenshot_url: string;
    payment_status: string;
    admin_notes: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url: string;
  }>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ orderId, onClose, isAdmin = false }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'paid': return 'text-blue-400';
      case 'shipped': return 'text-purple-400';
      case 'delivered': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="text-white">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="text-white">Order not found</div>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold">Order ID:</span> {orderDetails.order.order_id}</p>
                <p><span className="font-semibold">Status:</span> <span className={getStatusColor(orderDetails.order.status)}>{orderDetails.order.status}</span></p>
                <p><span className="font-semibold">Total:</span> ₹{Number(orderDetails.order.total).toFixed(2)}</p>
                <p><span className="font-semibold">Date:</span> {new Date(orderDetails.order.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Customer Information</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold">Name:</span> {orderDetails.order.name}</p>
                <p><span className="font-semibold">Email:</span> {orderDetails.order.email}</p>
                <p><span className="font-semibold">Phone:</span> {orderDetails.order.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Delivery Address</h3>
            <div className="text-gray-300">
              <p>{orderDetails.order.address_line1}</p>
              {orderDetails.order.address_line2 && <p>{orderDetails.order.address_line2}</p>}
              <p>{orderDetails.order.city}, {orderDetails.order.state} - {orderDetails.order.pincode}</p>
            </div>
          </div>

          {/* Payment Information */}
          {orderDetails.order.transaction_id && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Payment Information</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold">Transaction ID:</span> {orderDetails.order.transaction_id}</p>
                <p><span className="font-semibold">Payment Status:</span> 
                  <span className={`ml-2 ${orderDetails.order.payment_status === 'approved' ? 'text-green-400' : orderDetails.order.payment_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {orderDetails.order.payment_status === 'rejected' ? 'Payment Failed' : orderDetails.order.payment_status}
                  </span>
                </p>
                {orderDetails.order.payment_status === 'rejected' && (
                  <p className="text-yellow-300 text-sm mt-2">
                    💡 If money was debited, it will be credited within 3 working days.
                  </p>
                )}
                {orderDetails.order.admin_notes && (
                  <p><span className="font-semibold">Admin Notes:</span> {orderDetails.order.admin_notes}</p>
                )}
                {isAdmin && orderDetails.order.screenshot_url && (
                  <div>
                    <p className="font-semibold mb-2">Payment Screenshot:</p>
                    <img 
                      src={`${UPLOAD_BASE_URL}/uploads/payments/${orderDetails.order.screenshot_url.split('/').pop()}`}
                      alt="Payment Screenshot"
                      className="max-w-xs rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
            <div className="space-y-3">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-600 rounded">
                  <img 
                    src={item.image_url ? `${item.image_url}` : '/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{item.name}</h4>
                    <p className="text-gray-300">Quantity: {item.quantity}</p>
                    <p className="text-gray-300">Price: ₹{Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex justify-between items-center text-xl font-bold text-white">
                <span>Total:</span>
                <span>₹{Number(orderDetails.order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};