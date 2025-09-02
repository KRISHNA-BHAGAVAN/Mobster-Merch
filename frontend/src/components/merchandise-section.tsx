import React from "react";
import { Card, CardBody, CardFooter, Button, Tabs, Tab } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const MerchandiseSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  
  const products: Product[] = [
    {
      id: 1,
      name: "OG Samurai T-Shirt",
      price: 29.99,
      image: "https://img.heroui.chat/image/clothing?w=400&h=500&u=og1",
      category: "clothing"
    },
    {
      id: 2,
      name: "Katana Hoodie",
      price: 49.99,
      image: "https://img.heroui.chat/image/clothing?w=400&h=500&u=og2",
      category: "clothing"
    },
    {
      id: 3,
      name: "Cherry Blossom Cap",
      price: 24.99,
      image: "https://img.heroui.chat/image/clothing?w=400&h=500&u=og3",
      category: "accessories"
    },
    {
      id: 4,
      name: "OG Movie Poster",
      price: 19.99,
      image: "https://img.heroui.chat/image/movie?w=400&h=500&u=og4",
      category: "collectibles"
    },
    {
      id: 5,
      name: "Samurai Pendant",
      price: 34.99,
      image: "https://img.heroui.chat/image/fashion?w=400&h=500&u=og5",
      category: "accessories"
    },
    {
      id: 6,
      name: "Limited Edition Figurine",
      price: 99.99,
      image: "https://img.heroui.chat/image/movie?w=400&h=500&u=og6",
      category: "collectibles"
    },
    {
      id: 7,
      name: "OG Embroidered Jacket",
      price: 79.99,
      image: "https://img.heroui.chat/image/clothing?w=400&h=500&u=og7",
      category: "clothing"
    },
    {
      id: 8,
      name: "Samurai Bandana",
      price: 14.99,
      image: "https://img.heroui.chat/image/fashion?w=400&h=500&u=og8",
      category: "accessories"
    }
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="merchandise" className="py-20 bg-cherry-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-storm text-primary mb-4 text-shadow-red">
            EXCLUSIVE MERCHANDISE
          </h2>
          <p className="text-lg font-ramisa text-foreground/80 max-w-2xl mx-auto">
            Bring home a piece of the legend with our official "They Call Him OG" merchandise collection.
          </p>
        </motion.div>

        <div className="mb-8">
          <Tabs 
            aria-label="Product Categories" 
            color="primary" 
            variant="light"
            selectedKey={selectedCategory} 
            onSelectionChange={setSelectedCategory as any}
            className="justify-center"
          >
            <Tab key="all" title="All Products" />
            <Tab key="clothing" title="Clothing" />
            <Tab key="accessories" title="Accessories" />
            <Tab key="collectibles" title="Collectibles" />
          </Tabs>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card 
                className="product-card bg-content1 border border-primary/10 overflow-visible"
                shadow="sm"
              >
                <CardBody className="p-0 overflow-hidden">
                  <div className="relative h-64 w-full">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button 
                        isIconOnly 
                        size="sm" 
                        color="primary" 
                        variant="flat" 
                        className="bg-background/50 backdrop-blur-sm"
                      >
                        <Icon icon="lucide:heart" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="flex flex-col items-start gap-2">
                  <div className="flex justify-between w-full">
                    <h3 className="font-ramisa text-foreground">{product.name}</h3>
                    <p className="font-storm text-primary">₹{product.price}</p>
                  </div>
                  <Button 
                    color="primary" 
                    variant="flat" 
                    size="sm" 
                    className="w-full font-ramisa"
                    startContent={<Icon icon="lucide:shopping-bag" />}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button 
            color="primary" 
            size="lg"
            className="font-ramisa"
            endContent={<Icon icon="lucide:external-link" />}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};