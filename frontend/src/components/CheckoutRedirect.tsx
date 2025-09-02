import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckoutPage } from './CheckoutPage';

export const CheckoutRedirect: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return <CheckoutPage orderData={orderData} />;
};