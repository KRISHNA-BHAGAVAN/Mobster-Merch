import React, { useState, useEffect } from 'react';
// TODO: Replace HeroUI components with Material-UI
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { productService, cartService, API_BASE_URL } from '../services';
import { Favorite } from "@mui/icons-material";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  stock: number;
}

interface CartItem {
  product_id: number;
  quantity: number;
}

export const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const [Liked, setLiked] = useState(false);

  const handleAddToCart = (productId: number) => {
    if (isAuthenticated) {
      addToCart(productId);
    } else {
      navigate("/login");
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
      await Promise.all([fetchCartItems(), refreshCart()]);
      showToast("Added to cart successfully!", "success");
    } catch (error) {
      showToast("Error adding to cart", "error");
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(productId);
      return;
    }

    // Check stock limit
    const product = featuredProducts.find((p) => p.product_id === productId);
    if (product && newQuantity > product.stock) {
      showToast(`Only ${product.stock} items available in stock`, "error");
      return;
    }

    try {
      await cartService.updateQuantity(productId, newQuantity);
      await Promise.all([fetchCartItems(), refreshCart()]);
    } catch (error) {
      showToast("Error updating quantity", "error");
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await cartService.removeByProductId(productId);
      await Promise.all([fetchCartItems(), refreshCart()]);
    } catch (error) {
      showToast("Error removing from cart", "error");
    }
  };

  const getCartQuantity = (productId: number): number => {
    const item = cartItems.find((item) => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      // Handle both API response formats
      const productsArray =
        response.products && Array.isArray(response.products)
          ? response.products
          : Array.isArray(response)
          ? response
          : [];
      setFeaturedProducts(productsArray.slice(0, 4)); // Get first 4 products
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    if (!isAuthenticated || !user) {
      setCartItems([]);
      return;
    }

    try {
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      setCartItems([]);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <motion.section
      id="featured"
      className="min-h-screen py-20 relative flex items-center"
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <h2 className="heading-font text-3xl md:text-4xl mb-4 text-shadow-red">
            FEATURED <span className="text-primary">MERCHANDISE</span>
          </h2>
          <div className="samurai-divider w-24 mx-auto mb-6"></div>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Exclusive items from the "They Call Him OG" collection. Limited
            quantities available.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={item}>
                  <div className="product-card bg-content1 border border-primary/20">
                    <div className="p-0">
                      <div className="aspect-[3/4] bg-foreground/10 animate-pulse"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-foreground/10 animate-pulse rounded"></div>
                        <div className="h-4 bg-foreground/10 animate-pulse rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            : featuredProducts.map((product) => (
                <motion.div key={product.product_id} variants={item}>
                  <div className="product-card bg-content1 border border-red-950 hover:border-none rounded-md overflow-hidden transition-all duration-300">
                    <div className="p-0 overflow-hidden">
                      <div className="relative aspect-[6/5]  overflow-hidden">
                        <img
                          src={
                            product.image_url
                              ? `${API_BASE_URL.replace("api", "")}${
                                  product.image_url
                                }`
                              : "/placeholder-image.jpg"
                          }
                          alt={product.name}
                          className="w-full h-full object-center transition-transform duration-500 hover:scale-105 cursor-pointer"
                          onClick={() => navigate(`/product/${product.product_id}`)}
                        />
                        <div>
                          <Favorite
                            onClick={() => toggleFavorite(product.product_id)}
                            sx={{
                              color: favorites.has(product.product_id)
                                ? "red"
                                : "white",
                              cursor: "pointer",
                              zIndex: 10,
                            }}
                            className="absolute top-2 right-2"
                          />
                        </div>
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-sm heading-font">
                          {product.category}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 
                          className="heading-font text-lg mb-1 line-clamp-2 cursor-pointer hover:text-red-500"
                          onClick={() => navigate(`/product/${product.product_id}`)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-sm text-foreground/70 mb-2 line-clamp-2 font-sans">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-primary font-bold font-mono">
                            ₹{product.price}
                          </p>
                          <p className="text-xs text-foreground/60">
                            Stock: {product.stock}
                          </p>
                        </div>
                        {getCartQuantity(product.product_id) > 0 ? (
                          <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2 gap-2">
                            <button
                              className="hover:text-red-500 p-1  border border-gray-400 rounded-sm"
                              onClick={() =>
                                updateQuantity(
                                  product.product_id,
                                  getCartQuantity(product.product_id) - 1
                                )
                              }
                            >
                              <Icon icon="lucide:minus" />
                            </button>
                            <span className="font-mono text-lg font-bold px-28 md:px-12 xl:px-16 rounded-md border border-gray-400 ">
                              {getCartQuantity(product.product_id)}
                            </span>
                            <button
                              className="hover:text-red-500 p-1 border border-gray-400 rounded-sm"
                              disabled={
                                getCartQuantity(product.product_id) >=
                                product.stock
                              }
                              onClick={() =>
                                updateQuantity(
                                  product.product_id,
                                  getCartQuantity(product.product_id) + 1
                                )
                              }
                            >
                              <Icon icon="lucide:plus" />
                            </button>
                          </div>
                        ) : (
                          <button
                            style={{ width: "100%" }}
                            className="heading-font tracking-wider text-sm bg-red-600 p-3 rounded-md cursor-pointer"
                            onClick={() => handleAddToCart(product.product_id)}
                          >
                            ADD TO CART
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>

        <div className="text-center mt-12">
          <button
            className="heading-font tracking-wider hover:text-red-500 text-xl cursor-pointer"
            onClick={() => navigate("/products")}
          >
            VIEW ALL PRODUCTS
          </button>
          <div className="samurai-divider w-24 mx-auto"></div>
        </div>
      </motion.div>
    </motion.section>
  );
};
