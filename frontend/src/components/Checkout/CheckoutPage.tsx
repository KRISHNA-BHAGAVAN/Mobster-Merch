import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { checkoutService, paymentVerificationService, AddressData } from '../../services';

interface AddressForm {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [orderData, setOrderData] = useState<any>(null);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await checkoutService.prepareCheckout(addressForm);
      setOrderData(data);
      setSavedAddress(addressForm);
      setStep('payment');
      toast.success('Ready for payment!');
    } catch (error: any) {
      toast.error(error.message || 'Error preparing checkout');
    }
  };

  const handlePaymentComplete = () => {
    toast.success('Payment submitted for verification!');
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        
        {step === 'address' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Delivery Address</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Address Line 1"
                value={addressForm.address_line1}
                onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={addressForm.address_line2}
                onChange={(e) => setAddressForm({...addressForm, address_line2: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Continue to Payment
              </button>
            </form>
          </motion.div>
        )}

        {step === 'payment' && orderData && savedAddress && (
          <PaymentStep 
            orderData={orderData}
            address={savedAddress}
            onComplete={handlePaymentComplete}
          />
        )}
      </div>
    </div>
  );
};

interface PaymentStepProps {
  orderData: any;
  address: AddressData;
  onComplete: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ orderData, address, onComplete }) => {
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId || !screenshot) {
      toast.error('Please provide transaction ID and screenshot');
      return;
    }

    setSubmitting(true);
    
    try {
      await paymentVerificationService.submitPayment({
        address,
        transaction_id: transactionId,
        screenshot
      });
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Error submitting payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 p-6 rounded-xl"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Complete Payment</h2>
      
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <p className="text-white mb-2">Order ID: <span className="font-mono">{orderData.order_id}</span></p>
        <p className="text-white mb-4">Amount: <span className="font-semibold">₹{orderData.total}</span></p>
        
        <div className="mb-4">
          <p className="text-white mb-2">UPI ID: <span className="font-mono">{orderData.upi_id}</span></p>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderData.upi_link)}`}
                alt="UPI Payment QR Code"
                className="w-48 h-48"
              />
              <p className="text-gray-800 text-sm text-center mt-2">Scan to Pay</p>
            </div>
            
            <div className="text-center">
              <p className="text-white mb-2">Or</p>
              <a 
                href={orderData.upi_link}
                className="inline-block py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Pay with UPI App
              </a>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
          required
        />
        
        <div>
          <label className="block text-white mb-2">Payment Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-red-600 file:text-white"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </form>
    </motion.div>
  );
};