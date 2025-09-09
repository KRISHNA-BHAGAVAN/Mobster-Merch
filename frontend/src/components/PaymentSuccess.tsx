import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { API_BASE_URL } from '../config/api';
import { Navbar } from './Navbar';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = async () => {
    try {
      // Get order ID from session
      const orderResponse = await fetch(`${API_BASE_URL}/phonepe/current-order`, {
        credentials: 'include'
      });
      
      if (!orderResponse.ok) {
        setError('Order ID not found in session');
        return;
      }
      
      const { orderId } = await orderResponse.json();

      // Check payment status with PhonePe
      const statusResponse = await fetch(`${API_BASE_URL}/phonepe/order-status/${orderId}`, {
        credentials: 'include'
      });
      
      const statusResult = await statusResponse.json();
      
      if (statusResponse.ok) {
        const orderState = statusResult.orderStatus?.data?.state || statusResult.orderStatus?.state;
        
        if (orderState === 'COMPLETED') {
          // Payment successful, show order details
          setOrderDetails({
            order_id: orderId,
            total: (statusResult.orderStatus?.data?.amount || statusResult.orderStatus?.amount) / 100,
            payment_status: 'completed',
            transaction_id: statusResult.orderStatus?.data?.transactionId || statusResult.orderStatus?.paymentDetails?.[0]?.transactionId,
            payment_mode: statusResult.orderStatus?.data?.paymentMode || statusResult.orderStatus?.paymentDetails?.[0]?.paymentMode,
            items: []
          });
          toast.success('Payment successful!');
        } else if (orderState === 'FAILED') {
          setError('Payment failed');
          toast.error('Payment failed');
        } else {
          setError(`Payment status: ${orderState || 'Pending'}`);
          toast.error('Payment not completed');
        }
      } else {
        setError('Error checking payment status');
        toast.error('Error checking payment status');
      }
    } catch (error) {
      setError('Error processing payment');
      toast.error('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <Icon icon="lucide:loader-2" className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-white text-lg">Processing your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center max-w-md mx-auto p-6">
            <Icon icon="lucide:x-circle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Icon icon="lucide:check-circle" className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-300">Your order has been placed successfully</p>
        </motion.div>

        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Order ID:</span>
                <span className="text-white font-mono">{orderDetails.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Amount Paid:</span>
                <span className="text-white font-semibold">₹{orderDetails.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Payment Method:</span>
                <span className="text-white">PhonePe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className="text-green-400 font-semibold">Paid</span>
              </div>
            </div>

            {orderDetails.items && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div>
                        <p className="text-white">{item.name}</p>
                        <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="text-center space-y-4">
          <button
            onClick={() => navigate('/orders')}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="w-full py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};