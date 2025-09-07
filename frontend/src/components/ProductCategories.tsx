import React, { useState, useEffect } from 'react';
// TODO: Replace HeroUI components with Material-UI
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { categoryService, productService, Category, API_BASE_URL } from '../services';

interface CategoryWithCount extends Category {
  count: number;
}

export const ProductCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      
      // Get product count for each category
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const products = await productService.getProductsByCategory(category.category_id);
            return {
              ...category,
              count: Array.isArray(products) ? products.length : 0
            };
          } catch (error) {
            return {
              ...category,
              count: 0
            };
          }
        })
      );
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="collections" className="py-1 bg-content2/50 mb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-font text-3xl md:text-4xl mb-4 text-shadow-red">
            PRODUCT <span className="text-primary">CATEGORIES</span>
          </h2>
          <div className="samurai-divider w-24 mx-auto mb-6"></div>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Browse our exclusive "They Call Him OG" merchandise collections.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <motion.div key={index} variants={item}>
                  <div className="overflow-hidden border border-primary/20 h-[300px]">
                    <div className="p-0">
                      <div className="w-full h-full bg-foreground/10 animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            : categories.map((category) => (
                <motion.div key={category.category_id} variants={item}>
                  <div
                    className="overflow-hidden border border-gray-300 h-[300px] cursor-pointer rounded-xl "
                    onClick={() =>
                      navigate(`/category/${category.category_id}`)
                    }
                  >
                    <div className="p-0 overflow-hidden">
                      <div className="relative w-full h-full">
                        <img
                          src={
                            category.image_url
                              ? `${API_BASE_URL.replace("/api", "")}/${
                                  category.image_url
                                }`
                              : "/placeholder-image.jpg"
                          }
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />

                        {/* product count in top-right (no style change, only position) */}
                        <p className="absolute top-3 right-3 text-primary font-mono">
                          {category.count} Products
                        </p>

                        {/* bottom gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                          <h3 className="heading-font text-2xl mb-1 text-red-800">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-white/80 text-sm mb-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>
      </div>
    </section>
  );
};
