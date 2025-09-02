import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { orderService, paymentService } from '../services';
import QRCode from 'qrcode.react';

interface CheckoutPageProps {
  orderData?: any;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ orderData: propOrderData }) => {
  const [orderData, setOrderData] = useState<any>(propOrderData || null);
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (propOrderData) {
      setOrderData(propOrderData);
    }
  }, [propOrderData]);

  const fetchOrderDetails = async () => {
    try {
      // This would need to be implemented in orderService
      // For now, we'll assume order data is passed via navigation state
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!orderData?.order_id) return;
    
    setLoading(true);
    try {
      await paymentService.confirmPayment({
        order_id: orderData.order_id,
        transaction_ref: transactionRef
      });
      
      showToast('Payment confirmation received! Awaiting verification.', 'success');
      navigate(`/payment-status/${orderData.order_id}`);
    } catch (error) {
      showToast('Error confirming payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="heading-font text-3xl mb-4">Complete Payment</h1>
          <p className="text-foreground/70">Order #{orderData.order_id}</p>
        </div>

        <Card className="mb-6">
          <CardBody className="p-6">
            <h3 className="font-semibold text-xl mb-4">Order Summary</h3>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-primary">₹{orderData.total}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardBody className="p-6 text-center">
            <h3 className="font-semibold text-xl mb-4">Pay with UPI</h3>
            
            {/* QR Code */}
            <div className="mb-6">
              <QRCode 
                value={orderData.upi_link} 
                size={200}
                className="mx-auto"
              />
              <p className="text-sm text-foreground/70 mt-2">
                Scan QR code with any UPI app
              </p>
            </div>

            {/* UPI Link Button */}
            <Button
              color="primary"
              size="lg"
              className="mb-4"
              startContent={<Icon icon="lucide:smartphone" />}
              onPress={() => window.open(orderData.upi_link, '_blank')}
            >
              Pay with UPI App
            </Button>

            <div className="border-t pt-4">
              <p className="text-sm text-foreground/70 mb-4">
                After completing payment, enter your transaction reference (optional)
              </p>
              
              <Input
                label="Transaction Reference (Optional)"
                placeholder="Enter UPI transaction ID"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="mb-4"
              />

              <Button
                color="success"
                size="lg"
                fullWidth
                isLoading={loading}
                onPress={handlePaymentConfirmation}
                startContent={<Icon icon="lucide:check-circle" />}
              >
                I Have Paid
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="text-center">
          <Button
            variant="flat"
            onPress={() => navigate('/cart')}
            startContent={<Icon icon="lucide:arrow-left" />}
          >
            Back to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};