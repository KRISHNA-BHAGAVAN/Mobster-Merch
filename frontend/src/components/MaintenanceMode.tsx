import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export const MaintenanceMode: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-8"
          >
            <Icon icon="lucide:settings" className="w-24 h-24 text-orange-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Checkout Temporarily Unavailable
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            We're currently updating our checkout system. 
            You can still browse products. Checkout will be back soon!
          </p>
          
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-orange-500 text-lg"
          >
            Coming back soon...
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};