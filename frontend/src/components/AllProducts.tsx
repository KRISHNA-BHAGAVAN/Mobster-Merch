import React, { useState, useEffect } from "react";
// TODO: Replace HeroUI components with Material-UI
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { productService, cartService, API_BASE_URL } from "../services";
import { FloatingCart } from "./FloatingCart";
import { Favorite } from "@mui/icons-material";

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
  // const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [Liked, setLiked] = useState(false);

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

    // Check stock limit
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
      // Handle both API response formats
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

  // Filtered products based on search
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
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <div>
            <h1 className="heading-font text-3xl md:text-4xl mb-4">
              ALL <span className="text-primary">PRODUCTS</span>
            </h1>
            <div className="samurai-divider w-24 mb-6"></div>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
          <div className="flex justify-end mb-6 mt-7">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-items-end gap-2 mb-8 hover:text-red-500 cursor-pointer"
            >
              <Icon icon="lucide:arrow-left" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Products Grid */}
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
                          onClick={() =>
                            navigate(`/product/${product.product_id}`)
                          }
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
                          onClick={() =>
                            navigate(`/product/${product.product_id}`)
                          }
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
                              className="hover:text-red-500 p-1  border border-gray-400 rounded-sm hover:cursor-pointer"
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
                              className="hover:text-red-500 cursor-pointer p-1 border border-gray-400 rounded-sm"
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
                            className="heading-font tracking-wider hover: cursor-pointer text-sm bg-red-600 p-3 rounded-md"
                            style={{ width: "100%" }}
                          >
                            {product.is_deleted < 1 ? (
                              <button className="hover:cursor-pointer"
                                onClick={() =>
                                  handleAddToCart(product.product_id)
                                }
                              >
                                ADD To Cart
                              </button>
                            ) : (
                              <button
                              // onClick={() =>
                              //   handleAddToCart(product.product_id)
                              // }
                              >
                                Notify Me
                              </button>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
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
      <FloatingCart />
    </div>
  );
};
