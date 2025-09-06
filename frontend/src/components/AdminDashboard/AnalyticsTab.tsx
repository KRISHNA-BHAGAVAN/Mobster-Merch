import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalStats: {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
  };
  statusStats: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  paymentStats: Array<{
    status: string;
    count: number;
  }>;
  dailySales: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
}

export const AnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/admin/reports/analytics', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-white">No analytics data available</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-700 p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-400">₹{Number(analytics.totalStats.total_revenue).toFixed(2)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-700 p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-400">{analytics.totalStats.total_orders}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-700 p-6 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Average Order Value</h3>
          <p className="text-3xl font-bold text-purple-400">₹{Number(analytics.totalStats.average_order_value).toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {analytics.statusStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${getStatusColor(stat.status)}`}></div>
                  <span className="text-white capitalize">{stat.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{stat.count} orders</div>
                  <div className="text-gray-400 text-sm">₹{Number(stat.revenue).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Status</h3>
          <div className="space-y-3">
            {analytics.paymentStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-white capitalize">{stat.status}</span>
                <span className="text-white font-semibold">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-700 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Sold</th>
                <th className="text-right py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="py-2">{product.name}</td>
                  <td className="text-right py-2">{product.total_sold}</td>
                  <td className="text-right py-2">₹{Number(product.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Daily Sales (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Orders</th>
                <th className="text-right py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailySales.slice(0, 10).map((day, index) => (
                <tr key={index} className="border-b border-gray-600">
                  <td className="py-2">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="text-right py-2">{day.orders}</td>
                  <td className="text-right py-2">₹{Number(day.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};