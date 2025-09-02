import React from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 japanese-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-storm text-primary mb-4 text-shadow-red">
            THE LEGEND OF OG
          </h2>
          <p className="text-lg font-ramisa text-foreground/80 max-w-2xl mx-auto">
            The story behind the samurai who became a legend.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-content1 border border-primary/10">
              <CardBody className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-8 bg-primary mr-3"></div>
                  <h3 className="text-2xl font-storm text-foreground">THE FILM</h3>
                </div>
                <p className="text-foreground/80 mb-4">
                  "They Call Him OG" is an epic tale of honor, revenge, and redemption set in feudal Japan. 
                  Directed by acclaimed filmmaker Raj Verma, the movie follows the journey of a disgraced 
                  samurai seeking to restore his honor while protecting a village from ruthless warlords.
                </p>
                <p className="text-foreground/80 mb-4">
                  Starring Pawan Kalyan as the legendary warrior, the film blends traditional samurai 
                  storytelling with modern cinematography, creating a visual masterpiece that pays homage 
                  to classic Japanese cinema while delivering heart-pounding action sequences.
                </p>
                <div className="flex items-center gap-4 text-foreground/60">
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:star" className="text-primary" />
                    <span>9.2/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:clock" />
                    <span>162 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:calendar" />
                    <span>2023</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
              <img 
                src="https://img.heroui.chat/image/movie?w=800&h=450&u=og10" 
                alt="They Call Him OG Movie Scene" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <Icon icon="lucide:play" className="text-white text-2xl" />
                </div>
              </div>
            </div>
            
            {/* Japanese characters overlay */}
            <div className="absolute -bottom-5 -right-5 text-6xl font-storm text-primary/20 rotate-12">
              侍
            </div>
          </motion.div>
        </div>

        <Divider className="my-16 bg-primary/20" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="lucide:sword" className="text-primary text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-storm text-foreground mb-2">HONOR</h3>
            <p className="text-foreground/70">
              The samurai code of honor is at the heart of the film, guiding our protagonist through his darkest moments.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="lucide:heart" className="text-primary text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-storm text-foreground mb-2">SACRIFICE</h3>
            <p className="text-foreground/70">import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

              The willingness to sacrifice everything for what is right defines the true spirit of a warrior.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="lucide:mountain" className="text-primary text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-storm text-foreground mb-2">REDEMPTION</h3>
            <p className="text-foreground/70">
              Through trials and tribulations, our hero finds a path to redemption and inner peace.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};