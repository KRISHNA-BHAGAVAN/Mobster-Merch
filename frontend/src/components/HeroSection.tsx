import React from 'react';
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `url('/images/sword-bg.JPG')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(2.5) contrast(1)'
        }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 cherry-blossom-overlay"></div>
        
        {/* Blue Lightning Effect - Right Side Only */}
        <motion.div 
          className="absolute top-10 right-0 left 70 w-1/2 h-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0, 0.5, 0, 0.9, 0] 
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1
          }}
        />
        

        

      </div>

      {/* Rain Effect */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`
            }}
            animate={{
              y: [0, window.innerHeight + 100]
            }}
            transition={{
              duration: Math.random() * 0.5 + 0.5,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            
            <h1 className="heading-font text-5xl md:text-7xl lg:text-8xl mb-6" style={{
              textShadow: '0 0 5px #4e98ffff, 0 0 10px #6aa2fcff, 0 0 15px #0073ffff',
              color: '#f2f2f3ff'
            }}>
              Mobster <br />
              <span className="text-primary" style={{
                textShadow: '0 0 5px #000000ff, 0 0 10px #ff0000, 0 0 15px #ff0000',
                color: '#ff0000'
              }}>Merch</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
              Embrace the spirit of the samurai with our exclusive collection 
            </p>
              
            <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
            Limited edition merchandise available now
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                color="primary"
                className="heading-font tracking-wider text-lg"
                startContent={<Icon icon="lucide:shopping-bag" />}
                onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
              >
                SHOP NOW
              </Button>
             
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
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
            <Icon icon="lucide:chevron-down" className="w-8 h-8 text-primary" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};