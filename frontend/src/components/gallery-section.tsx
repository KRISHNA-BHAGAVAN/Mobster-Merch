import React from "react";
// TODO: Replace HeroUI components with Material-UI
import { motion } from "framer-motion";

export const GallerySection: React.FC = () => {
  const images = [
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og11",
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og12",
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og13",
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og14",
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og15",
    "https://img.heroui.chat/image/movie?w=600&h=400&u=og16",
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <section id="gallery" className="py-20 bg-cherry-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-storm text-primary mb-4 text-shadow-red">
            GALLERY
          </h2>
          <p className="text-lg font-ramisa text-foreground/80 max-w-2xl mx-auto">
            Glimpses from the epic saga of "They Call Him OG"
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {images.map((image, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="relative group overflow-hidden rounded-lg"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-lg border border-primary/10">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  removeWrapper
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <p className="text-foreground font-ramisa text-center">
                    Scene {index + 1} from "They Call Him OG"
                  </p>
                </div>
              </div>
              
              {/* Japanese character watermark */}
              {index % 2 === 0 && (
                <div className="absolute top-2 right-2 text-2xl font-storm text-primary/30 rotate-12">
                  侍
                </div>
              )}
              {index % 2 === 1 && (
                <div className="absolute bottom-2 left-2 text-2xl font-storm text-secondary/30 -rotate-6">
                  武士
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};