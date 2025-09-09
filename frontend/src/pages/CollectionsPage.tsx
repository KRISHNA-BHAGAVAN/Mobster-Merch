import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate, useLocation } from 'react-router-dom';
import { categoryService, productService, Category } from '../services';
import { Navbar } from '../components/Navbar';

interface CategoryWithCount extends Category {
  count: number;
}

interface CollectionProps {
  showNavbar?: boolean;
}

export const CollectionsPage: React.FC<CollectionProps> = ({ showNavbar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowNavbar = showNavbar ?? location.state?.showNavbar ?? false;

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  const fetchCategoriesWithCount = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      console.log("Fetched categories from pages:", categoriesData);
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
    <div className=" bg-background">
      {shouldShowNavbar && <Navbar />}
      <section className="py-10 bg-content2/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-font text-3xl md:text-4xl mb-4 text-shadow-red">
              PRODUCT <span className="text-primary">COLLECTIONS</span>
            </h2>
            <div className="samurai-divider w-24 mx-auto mb-6"></div>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Browse our exclusive merchandise collections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                      className="overflow-hidden border border-gray-300 h-[300px] cursor-pointer rounded-xl"
                      onClick={() =>
                        navigate(`/category/${category.category_id}`)
                      }
                    >
                      <div className="p-0 overflow-hidden">
                        <div className="relative w-full max-h-[300px]">
                          <img
                            src={
                              category.image_url
                                ? `${category.image_url}`
                                : "/placeholder-image.jpg"
                            }
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />

                          <p className="absolute top-3 right-3 text-primary font-mono">
                            {category.count} Products
                          </p>

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
          </div>
        </div>
      </section>
      <div className="text-center mt-12">
        <button
          className="heading-font tracking-wider hover:text-red-500 text-xl cursor-pointer"
          onClick={() => navigate("/collections")}
        >
          VIEW ALL COLLECTIONS
        </button>
        <div className="samurai-divider w-24 mx-auto"></div>
      </div>
    </div>
  );
};