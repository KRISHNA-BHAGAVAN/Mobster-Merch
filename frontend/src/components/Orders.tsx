import React, { useState, useEffect } from 'react';
// TODO: Replace HeroUI components with Material-UI
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService, API_BASE_URL } from '../services';

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string;
}

interface Order {
  order_id: string;
  total: number;
  status: string;
  created_at: string;
  payment_status?: string;
  payment_method?: string;
  items: OrderItem[];
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders(user?.id!);
      
      // Group order items by order_id
      const groupedOrders = data.reduce((acc: any, row: any) => {
        if (!acc[row.order_id]) {
          acc[row.order_id] = {
            order_id: row.order_id,
            total: row.total,
            status: row.status,
            created_at: row.created_at,
            payment_status: row.payment_status,
            payment_method: row.payment_method,
            items: []
          };
        }
        
        if (row.product_id) {
          acc[row.order_id].items.push({
            product_id: row.product_id,
            quantity: row.quantity,
            price: row.price,
            name: row.name,
            image_url: row.image_url
          });
        }
        
        return acc;
      }, {});
      
      setOrders(Object.values(groupedOrders));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.requestCancellation(orderId);
      showToast('Cancellation request submitted successfully', 'success');
    } catch (error) {
      showToast('Error submitting cancellation request', 'error');
    }
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'paid', 'shipped'].includes(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-font text-3xl">My Orders</h1>
          <button  onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="lucide:package" className="h-16 w-16 text-foreground/50 mx-auto mb-4" />
            <p className="text-foreground/70 mb-4">No orders found</p>
            <button  onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.order_id}</h3>
                      <p className="text-sm text-foreground/70">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      {order.payment_method && (
                        <p className="text-xs text-foreground/60 mt-1">
                          Payment: {order.payment_method.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 mb-2">
                        <span color={getStatusColor(order.status)}  >
                          {order.status.toUpperCase()}
                        </span>
                        {order.payment_status && (
                          <span 
                            color={order.payment_status === 'completed' ? 'success' : order.payment_status === 'pending' ? 'warning' : 'danger'} 
                             
                            
                          >
                            {order.payment_status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-lg">
                        ₹{Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 bg-content2 rounded">
                        <img 
                          src={item.image_url ? `${API_BASE_URL.replace('/api', '')}${item.image_url}` : '/placeholder.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-foreground/70">
                            Quantity: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{(Number(item.quantity) * Number(item.price)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {canCancelOrder(order.status) && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        
                        
                        
                        
                        onClick={() => handleCancelOrder(order.order_id)}
                      >
                        Request Cancellation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        

      </div>
    </div>
  );
};