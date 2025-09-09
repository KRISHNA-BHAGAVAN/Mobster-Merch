import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { productService, cartService } from '../services';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/Products/ProductCard';
import { useNavigate, useLocation } from 'react-router-dom';



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

interface FeaturedMerchandisePageProps {
  showNavbar?: boolean;
}

interface LocationState {
  showNavbar?: boolean;
}

export const FeaturedMerchandisePage: React.FC<FeaturedMerchandisePageProps> = ({showNavbar}) => {
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const shouldShowNavbar = showNavbar ?? state?.showNavbar ?? false;
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

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
      const productsArray =
        response.products && Array.isArray(response.products)
          ? response.products
          : Array.isArray(response)
          ? response
          : [];
      setFeaturedProducts(productsArray.slice(0, 4));
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
    <div className="min-h-screen bg-background sticky top-0 bottom-50 z-10">
      {shouldShowNavbar && <Navbar />}
      <motion.section
        className="min-h-screen py-10 relative flex items-center"
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
          <div className="text-center mb-8 mt-10">
            <h2 className="heading-font text-3xl md:text-4xl mb-4 text-shadow-red">
              FEATURED <span className="text-primary">MERCHANDISE</span>
            </h2>
            <div className="samurai-divider w-24 mx-auto mb-6"></div>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Exclusive items from the collection. Limited
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
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    favorites={favorites}
                    cartQuantity={getCartQuantity(product.product_id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={updateQuantity}
                    variants={item}
                  />
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

    </div>
  );
};