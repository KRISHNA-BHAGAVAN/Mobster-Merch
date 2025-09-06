import React, { useState } from 'react';
import { Order } from '../../services/adminService';
import { OrderDetailsModal } from '../Orders/OrderDetailsModal';

interface OrdersTabProps {
  orders: Order[];
  orderStatusFilter: string;
  setOrderStatusFilter: (filter: string) => void;
  handleOrderStatusUpdate: (orderId: string, status: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  handleOrderStatusUpdate
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  return (
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
          <div 
            key={order.order_id} 
            className="bg-gray-900 p-4 rounded-xl shadow-md border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => setSelectedOrderId(order.order_id)}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Arial, sans-serif' }}>Order #{order.order_id}</h3>
                <p className="text-sm text-gray-400">{order.user_name} ({order.email})</p>
                <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="text-right mt-2 sm:mt-0">
                <p className="text-xl font-bold text-red-500">₹{order.total}</p>
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
      
      {selectedOrderId && (
        <OrderDetailsModal 
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};