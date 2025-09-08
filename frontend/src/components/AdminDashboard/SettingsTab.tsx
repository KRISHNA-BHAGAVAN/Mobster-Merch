import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsService } from '../../services/settingsService';

export const SettingsTab: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'phonepe'>('manual');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const fetchPaymentMethod = async () => {
    try {
      const data = await settingsService.getPaymentMethod();
      setPaymentMethod(data.method as 'manual' | 'phonepe');
    } catch (error) {
      toast.error('Error fetching payment method');
    }
  };

  const handlePaymentMethodChange = async (method: 'manual' | 'phonepe') => {
    setLoading(true);
    try {
      await settingsService.updatePaymentMethod(method);
      setPaymentMethod(method);
      toast.success(`Payment method switched to ${method === 'manual' ? 'Manual UPI' : 'PhonePe Gateway'}`);
    } catch (error) {
      toast.error('Error updating payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Payment Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">
              Payment Method
            </label>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="manual"
                  checked={paymentMethod === 'manual'}
                  onChange={() => handlePaymentMethodChange('manual')}
                  disabled={loading}
                  className="w-4 h-4 text-red-500 border-gray-600 focus:ring-red-500 bg-gray-700"
                />
                <span className="text-white">Manual UPI</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="phonepe"
                  checked={paymentMethod === 'phonepe'}
                  onChange={() => handlePaymentMethodChange('phonepe')}
                  disabled={loading}
                  className="w-4 h-4 text-red-500 border-gray-600 focus:ring-red-500 bg-gray-700"
                />
                <span className="text-white">PhonePe Gateway</span>
              </label>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <p><strong>Manual UPI:</strong> Customers pay via UPI link and upload payment screenshot</p>
            <p><strong>PhonePe Gateway:</strong> Automated payment processing through PhonePe</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${paymentMethod === 'manual' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-300">
              Current: {paymentMethod === 'manual' ? 'Manual UPI' : 'PhonePe Gateway'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};