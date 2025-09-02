import React from 'react';
import { Button, Badge } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
    >
      <Badge 
        content={cartCount} 
        color="#ffffffff" 
        shape="circle" 
        showOutline={false}
        placement="top-right"
        isInvisible={cartCount === 0}
      >
        <Button
          isIconOnly
          color="primary"
          aria-label="Cart"
          size="lg"
          className="shadow-lg"
          onPress={handleCartClick}
        >
          <Icon icon="lucide:shopping-cart" className="h-6 w-6" />
        </Button>
      </Badge>
    </motion.div>
  );
};