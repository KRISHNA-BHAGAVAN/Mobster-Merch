import React from 'react';
import { Fab, Badge } from '@mui/material';
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
      className="fixed bottom-15 right-8 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
    >
      <Badge
        badgeContent={cartCount}
        color="primary"
        invisible={cartCount === 0}
      >
        <Fab
          color="primary"
          aria-label="Cart"
          onClick={handleCartClick}
          sx={{ boxShadow: 3 }}
        >
          <Icon icon="lucide:shopping-cart" className="h-6 w-6" />
        </Fab>
      </Badge>
    </motion.div>
  );
};