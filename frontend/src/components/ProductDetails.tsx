import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Favorite } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { productService, cartService, API_BASE_URL } from "../services";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  stock: number;
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      showToast("Product not found", "error");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await cartService.addToCart({
        product_id: product!.product_id,
        quantity,
      });
      await refreshCart();
      showToast("Added to cart successfully!", "success");
    } catch (error) {
      showToast("Error adding to cart", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon
          icon="lucide:loader-2"
          className="animate-spin h-8 w-8 text-primary"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-6 mt-7">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center justify-items-end gap-2 mb-8 hover:text-red-500 cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" />
            Back to Products
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Product Image */}
          <div className="relative">
            <img
              src={
                product.image_url
                  ? `${API_BASE_URL.replace("api", "")}${product.image_url}`
                  : "/placeholder-image.jpg"
              }
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <Favorite
              onClick={() => setIsFavorite(!isFavorite)}
              sx={{
                color: isFavorite ? "red" : "gray",
                cursor: "pointer",
                fontSize: "2rem",
              }}
              className="absolute top-4 right-4"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="text-red-500 text-sm font-semibold">
                {product.category}
              </span>
              <h1 className="heading-font text-3xl lg:text-4xl mt-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-red-500 mt-4">
                ₹{product.price}
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm">Stock: {product.stock} available</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span>Quantity:</span>
              <div className="flex items-center border border-gray-400 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-700"
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-400">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-1 hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-md font-semibold transition-colors"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
