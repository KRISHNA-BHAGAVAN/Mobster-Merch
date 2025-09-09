import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { productService, cartService } from "../services";

import { Navbar } from "../components/Navbar";
import { ProductCard } from "../components/Products/ProductCard";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  stock: number;
  is_deleted: number;
}

interface CartItem {
  product_id: number;
  quantity: number;
}

export const AllProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleAddToCart = (productId: number) => {
    if (isAuthenticated && user) {
      addToCart(productId);
    } else {
      showToast("Please login to add items to cart", "error");
      navigate("/login");
    }
  };

  const addToCart = async (productId: number) => {
    if (!isAuthenticated || !user) {
      showToast("Please login to add items to cart", "error");
      navigate("/login");
      return;
    }

    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
      await Promise.all([fetchCartItems(), refreshCart()]);
      showToast("Added to cart successfully!", "success");
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Please login to add items to cart", "error");
      navigate("/login");
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.product_id === productId);
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
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="lucide:loader-2"
            className="animate-spin h-8 w-8 text-primary mx-auto mb-4"
          />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
            <div>
              <h1 className="heading-font text-3xl md:text-4xl mb-4">
                ALL <span className="text-primary">PRODUCTS</span>
              </h1>
              <div className="samurai-divider w-24 mb-0"></div>
            </div>

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex justify-end mb-6 mt-7">
              {/* <button
                onClick={() => navigate("/")}
                className="flex items-center justify-items-end gap-2 mb-8 hover:text-red-500 cursor-pointer"
              >
                <Icon icon="lucide:arrow-left" />
                Back to Home
              </button> */}
            </div>
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
              : products.map((product) => (
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Icon
                icon="lucide:package-x"
                className="h-16 w-16 text-foreground/50 mx-auto mb-4"
              />
              <p className="text-foreground/70">No products found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};