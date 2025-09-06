import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService, orderService } from '../../services';
import { OrderDetailsModal } from './OrderDetailsModal';

interface Order {
  order_id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  payment_status?: string;
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (!userData || !userData.id) {
        console.error('No user data or user ID');
        return;
      }
      const data = await orderService.getUserOrders(userData.id);
      
      // Group orders by order_id
      const groupedOrders = data.reduce((acc: any, item: any) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = {
            order_id: item.order_id,
            total: item.total,
            status: item.status,
            created_at: item.created_at,
            payment_status: item.payment_status,
            items: []
          };
        }
        if (item.name) {
          acc[item.order_id].items.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          });
        }
        return acc;
      }, {});
      
      setOrders(Object.values(groupedOrders));
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.message?.includes('Not authenticated')) {
        // Handle authentication error
        setOrders([]);
      }
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

  const getStatusText = (status: string, paymentStatus?: string) => {
    if (status === 'pending' && paymentStatus === 'rejected') {
      return 'Payment Failed';
    }
    switch (status) {
      case 'pending': return 'Payment Pending';
      case 'paid': return 'Order Confirmed';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-white text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <p className="text-gray-400 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => setSelectedOrderId(order.order_id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Order #{order.order_id}
                    </h3>
                    <p className="text-gray-400">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{order.total}</p>
                    <p className={`font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status, order.payment_status)}
                    </p>
                    
                  </div>
                </div>
                
                {(order as any).items && (order as any).items.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-white font-semibold mb-2">Items:</h4>
                    <div className="space-y-2">
                      {(order as any).items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-gray-300">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      {order.status === 'pending' && order.payment_status === 'rejected' && (
                      <p className="text-yellow-300 text-xs mt-1">
                        Money will be credited in 3 working days(If money was debited).
                      </p>
                    )}
                      {order.status === 'pending' && order.payment_status !== 'rejected' && (
                        <span>⏳ Waiting for payment verification</span>
                      )}
                      {order.status === 'paid' && (
                        <span>✅ Payment verified, preparing for shipment</span>
                      )}
                      {order.status === 'shipped' && (
                        <span>🚚 Your order is on the way</span>
                      )}
                      {order.status === 'delivered' && (
                        <span>📦 Order delivered successfully</span>
                      )}
                      {order.status === 'cancelled' && (
                        <span>❌ Order has been cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {selectedOrderId && (
          <OrderDetailsModal 
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </div>
    </div>
  );
};