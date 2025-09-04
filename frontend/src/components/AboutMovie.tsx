import React from 'react';
// TODO: Replace HeroUI components with Material-UI
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';

export const AboutMovie: React.FC = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ 
        backgroundImage: `url(https://img.heroui.chat/image/movie?w=1920&h=1080&u=og_movie_scene)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.2
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-font text-3xl md:text-4xl mb-4 text-shadow-red">
              ABOUT <span className="text-primary">THE MOVIE</span>
            </h2>
            <div className="samurai-divider w-24 mb-6"></div>
            
            <p className="mb-4 text-foreground/90">
              "They Call Him OG" is an epic samurai tale starring Pawan Kalyan as a legendary warrior seeking redemption in feudal Japan. Directed by acclaimed filmmaker Haruki Tanaka, this action-packed film blends traditional Japanese samurai culture with modern storytelling.
            </p>
            
            <p className="mb-6 text-foreground/90">
              The film follows the journey of a disgraced samurai who must confront his past and fight for honor in a land torn by war. With breathtaking cinematography and intense sword fighting sequences, "They Call Him OG" has become a cultural phenomenon.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-content1 px-4 py-2 border border-primary/20">
                <span className="block text-xs text-foreground/70">Director</span>
                <span className="block text-primary font-mono">Sujeeth</span>
              </div>
              <div className="bg-content1 px-4 py-2 border border-primary/20">
                <span className="block text-xs text-foreground/70">Starring</span>
                <span className="block text-primary font-mono">Pawan Kalyan</span>
              </div>
              <div className="bg-content1 px-4 py-2 border border-primary/20">
                <span className="block text-xs text-foreground/70">Release</span>
                <span className="block text-primary font-mono">2025</span>
              </div>
            </div>
            
            <button 
               
              
              className="heading-font tracking-wider"
              
            >
              WATCH TRAILER
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[2/3] relative">
              <img 
                src="https://img.heroui.chat/image/movie?w=800&h=1200&u=og_movie_poster" 
                alt="They Call Him OG Movie Poster" 
                className="w-full h-full object-cover rounded-sm border-2 border-primary/50 shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32">
                <img 
                  src="https://img.heroui.chat/image/movie?w=200&h=200&u=og_movie_seal" 
                  alt="Official Movie Seal" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};