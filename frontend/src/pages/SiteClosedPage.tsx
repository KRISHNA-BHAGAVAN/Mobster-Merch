import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const SiteClosedPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const navigateToRegisterPage = () => {
    showToast("Opening Registration page", "info");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg"
      >
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          🚧 Site Under Maintenance
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          We're currently upgrading our platform to serve you better.  
          Please check back soon. Thank you for your patience!
        </p>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">
            If you're a new user, you can still register.  
            Once we're back online, you'll be able to log in.
          </p>
        </div>
        <div>
          <a onClick={navigateToRegisterPage} className="text-red-500 hover:underline cursor-pointer mt-4 block">Register Here</a>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteClosedPage;