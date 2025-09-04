import React from 'react';
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 z-0 opacity-40 transition-opacity duration-500" 
        style={{ 
          backgroundImage: `url('/images/mumbai-hotel.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) brightness(0.6) contrast(1.2)'
        }}
      >
      </div>

      <div className="container mx-auto px-4 z-10 relative py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight" style={{ color: '#E50000' }}>
              Mobster
              <br />
              <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Merch</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl mb-6 max-w-2xl mx-auto font-light text-gray-300">
              Embrace the spirit of the samurai with our exclusive collection.
            </p>
              
            <p className="text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto font-light text-gray-400">
              Limited edition merchandise available now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  heading-font tracking-wide text-lg py-3 px-8 rounded-full font-bold
                  bg-white text-black border-2 border-white
                  hover:bg-transparent hover:text-white transition-all duration-300
                "
                onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
              >
                SHOP NOW
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <a href="#featured" aria-label="Scroll down">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#E50000]">
              <path d="M12 5v14"/>
              <path d="m19 12-7 7-7-7"/>
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
