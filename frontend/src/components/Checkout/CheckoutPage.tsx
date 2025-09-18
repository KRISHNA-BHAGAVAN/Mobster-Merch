import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { checkoutService, paymentVerificationService, orderService, AddressData } from '../../services';
import { API_BASE_URL } from '../../config/api';

interface AddressForm {
  address_line1: string;
  address_line2: string;
  city: string;
  district: string;
  state: string;
  country: string;
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
    district: '',
    state: '',
    country: '',
    pincode: ''
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [manualInputMode, setManualInputMode] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddressForm({...addressForm, pincode});
    setPincodeError('');
    
    if (pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/pincode/${pincode}`);
        const data = await response.json();
        
        if (data.error) {
          setPincodeSuccess(false);
          if (data.allowManualInput) {
            setManualInputMode(true);
            setPincodeError(data.message || 'Please enter address details manually');
            toast.error('Pincode service unavailable. Please enter details manually.');
          } else {
            setPincodeError(data.error);
          }
          setAvailableCities([]);
          setShowCityDropdown(false);
        } else {
          setPincodeSuccess(true);
          setManualInputMode(false);
          setPincodeError('');
          setAvailableCities(data.cities || []);
          setShowCityDropdown(data.cities && data.cities.length > 0);
          setAddressForm(prev => ({
            ...prev,
            city: data.cities && data.cities.length === 1 ? data.cities[0] : '',
            district: data.district || '',
            state: data.state || '',
            country: data.country || 'India'
          }));
        }
      } catch (error) {
        setPincodeSuccess(false);
        setManualInputMode(true);
        setPincodeError('Pincode service unavailable. Please enter address details manually.');
        toast.error('Pincode service unavailable. Please enter details manually.');
      } finally {
        setPincodeLoading(false);
      }
    } else if (pincode.length < 6) {
      setPincodeSuccess(false);
      setAvailableCities([]);
      setShowCityDropdown(false);
      setManualInputMode(false);
      setPincodeError('');
    }
  };

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
                id="address_line1"
                name="address_line1"
                type="text"
                placeholder="Address Line 1"
                value={addressForm.address_line1}
                onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
              <input
                id="address_line2"
                name="address_line2"
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={addressForm.address_line2}
                onChange={(e) => setAddressForm({...addressForm, address_line2: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <div className="relative">
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="Pincode (6 digits)"
                  value={addressForm.pincode}
                  onChange={handlePincodeChange}
                  maxLength={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-10"
                  required
                />
                {pincodeLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  </div>
                )}
              </div>
              {pincodeError && (
                <div className="text-red-400 text-sm">
                  <p>{pincodeError}</p>
                  {manualInputMode && (
                    <p className="text-yellow-400 mt-1">💡 You can now enter city, district, state, and country manually below.</p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {showCityDropdown ? (
                  <select
                    id="city"
                    name="city"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  >
                    <option value="">Select City/Area</option>
                    {availableCities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                )}
                <input
                  id="district"
                  name="district"
                  type="text"
                  placeholder="District"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                  className={`w-full p-3 border border-gray-600 rounded-lg text-white ${
                    pincodeSuccess && addressForm.district
                      ? 'bg-gray-600' 
                      : 'bg-gray-700'
                  }`}
                  readOnly={pincodeSuccess && addressForm.district}
                  required
                />
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  className={`w-full p-3 border border-gray-600 rounded-lg text-white ${
                    pincodeSuccess && addressForm.state
                      ? 'bg-gray-600' 
                      : 'bg-gray-700'
                  }`}
                  readOnly={pincodeSuccess && addressForm.state}
                  required
                />
                <input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                  className={`w-full p-3 border border-gray-600 rounded-lg text-white ${
                    pincodeSuccess && addressForm.country
                      ? 'bg-gray-600' 
                      : 'bg-gray-700'
                  }`}
                  readOnly={pincodeSuccess && addressForm.country}
                  required
                />
              </div>
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
          <>
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-xl mb-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="text-white font-semibold text-lg">₹{orderData.total}</span>
                </div>
              </div>

              {orderData.cart_items && (
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Items ({orderData.cart_items.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orderData.cart_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400 text-sm">₹{item.price} × {item.quantity}</p>
                        </div>
                        <p className="text-white font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">Delivery Address</h3>
                <div className="text-gray-300 text-sm">
                  <p>{savedAddress.address_line1}</p>
                  {savedAddress.address_line2 && <p>{savedAddress.address_line2}</p>}
                  <p>{savedAddress.city}{savedAddress.district && `, ${savedAddress.district}`}, {savedAddress.state}{savedAddress.country && `, ${savedAddress.country}`} - {savedAddress.pincode}</p>
                </div>
              </div>
            </motion.div>

            <PaymentStep 
              orderData={orderData}
              address={savedAddress}
              onComplete={handlePaymentComplete}
            />
          </>
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
  const navigate = useNavigate();

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

  const handlePhonePePayment = async () => {
    setSubmitting(true);
    try {
      const paymentData = {
        orderId: orderData.order_id || orderData.temp_order_id,
        amount: parseFloat(orderData.total),
        address: address
      };
      
      console.log('Sending PhonePe payment data:', paymentData);
      console.log('Full orderData:', orderData);
      
      const phonepeResult = await checkoutService.createPhonePePayment(paymentData);
      
      if (phonepeResult.checkoutUrl) {
        window.location.href = phonepeResult.checkoutUrl;
      } else {
        toast.error('No checkout URL received from PhonePe');
      }
    } catch (error: any) {
      console.error('PhonePe payment error:', error);
      toast.error(error.message || 'Error initiating PhonePe payment');
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
        <p className="text-white mb-2">Order ID: <span className="font-mono">{orderData.order_id || orderData.temp_order_id}</span></p>
        <p className="text-white mb-4">Amount: <span className="font-semibold">₹{orderData.total}</span></p>
        
        {orderData.payment_method === 'phonepe' ? (
          <div className="text-center">
            <p className="text-white mb-4">Pay securely with PhonePe Gateway</p>
            <button
              onClick={handlePhonePePayment}
              disabled={submitting}
              className="py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Pay with PhonePe'}
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {orderData.payment_method === 'manual' && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <input
            id="transaction_id"
            name="transaction_id"
            type="text"
            placeholder="Transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            required
          />
          
          <div>
            <label htmlFor="payment_screenshot" className="block text-white mb-2">Payment Screenshot</label>
            <input
              id="payment_screenshot"
              name="payment_screenshot"
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
      )}
    </motion.div>
  );
};