import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 1000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-600 text-green-400';
      case 'error':
        return 'bg-red-900/90 border-red-600 text-red-400';
      case 'info':
        return 'bg-blue-900/90 border-blue-600 text-blue-400';
      default:
        return 'bg-gray-900/90 border-gray-600 text-gray-400';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'lucide:check-circle';
      case 'error':
        return 'lucide:x-circle';
      case 'info':
        return 'lucide:info';
      default:
        return 'lucide:bell';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: 300,
                scale: 0.5,
                transition: { duration: 0.2 },
              }}
              className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm min-w-[300px] ${getToastStyles(
                toast.type
              )}`}
            >
              <Icon
                icon={getIcon(toast.type)}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="flex-1 text-sm font-medium">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current hover:opacity-70 transition-opacity"
              >
                <Icon icon="lucide:x" className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};