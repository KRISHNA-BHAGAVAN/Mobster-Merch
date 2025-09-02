import React from "react";
import { Button, Image } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden">
      {/* Cherry blossom petals animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-secondary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
            }}
            animate={{
              y: ["0vh", "100vh"],
              x: [
                `${Math.random() * 10 - 5}px`,
                `${Math.random() * 50 - 25}px`,
                `${Math.random() * 100 - 50}px`,
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.5, 1],
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-1/2 mb-10 lg:mb-0"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-storm text-primary mb-4 text-shadow-red">
            THEY CALL HIM OG
          </h1>
          <h2 className="text-xl md:text-2xl font-ramisa mb-6 text-foreground/90">
            <span className="inline-block border-b-2 border-secondary pb-1">
              Official Merchandise Collection
            </span>
          </h2>
          <p className="text-lg mb-8 max-w-lg text-foreground/80">
            Embrace the spirit of the samurai with our exclusive collection inspired by the legendary film. Limited edition items available now.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              color="primary" 
              size="lg"
              className="font-ramisa"
              endContent={<Icon icon="lucide:arrow-right" />}
            >
              Shop Collection
            </Button>
            <Button 
              variant="bordered" 
              color="default" 
              size="lg"
              className="font-ramisa border-foreground/30"
              startContent={<Icon icon="lucide:play" />}
            >
              Watch Trailer
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:w-1/2 relative"
        >
          <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
            <Image
              src="https://img.heroui.chat/image/movie?w=800&h=1000&u=og1"
              alt="They Call Him OG Movie Poster"
              className="object-cover w-full h-full rounded-lg"
              removeWrapper
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
            
            {/* Japanese characters overlay */}
            <div className="absolute top-4 right-4 text-4xl font-storm text-primary/80 rotate-12 text-shadow-red">
              侍
            </div>
            <div className="absolute bottom-4 left-4 text-3xl font-storm text-secondary/80 -rotate-6 text-shadow-white">
              武士
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <a href="#merchandise" className="text-foreground/70 hover:text-primary transition-colors">
            <Icon icon="lucide:chevrons-down" width={32} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};