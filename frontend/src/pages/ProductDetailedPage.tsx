import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Favorite } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { productService, cartService, wishlistService } from "../services";
import { Navbar } from "../components/Navbar";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  stock: number;
  additional_info?: any;
}

interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  value: string;
  options?: string[];
  required?: boolean;
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
      if (isAuthenticated) {
        checkWishlistStatus(parseInt(id));
      }
    }
  }, [id, isAuthenticated]);

  const fetchProduct = async (productId: number) => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
      setCurrentPrice(data.price);
      setCurrentStock(data.stock);
      
      // If product has variants, initialize selection
      if (data.additional_info?.variants && data.additional_info.variants.length > 0) {
        const firstVariant = data.additional_info.variants[0];
        setSelectedVariant(firstVariant.id);
        const basePrice = parseFloat(data.price) || 0;
        const modifier = parseFloat(firstVariant.price_modifier) || 0;
        setCurrentPrice(basePrice + modifier);
        setCurrentStock(firstVariant.stock || 0);
        
        // Initialize selected options
        const initialOptions: {[key: string]: string} = {};
        Object.entries(firstVariant.options || {}).forEach(([key, value]) => {
          initialOptions[key] = value as string;
        });
        setSelectedOptions(initialOptions);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showToast("Product not found", "error");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantOptionChange = (optionName: string, optionValue: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newSelectedOptions);
    
    // Find matching variant
    if (product?.additional_info?.variants) {
      const matchingVariant = product.additional_info.variants.find((variant: any) => {
        return Object.entries(newSelectedOptions).every(([key, value]) => 
          variant.options[key] === value
        );
      });
      
      if (matchingVariant) {
        setSelectedVariant(matchingVariant.id);
        const basePrice = parseFloat(product.price) || 0;
        const modifier = parseFloat(matchingVariant.price_modifier) || 0;
        setCurrentPrice(basePrice + modifier);
        setCurrentStock(matchingVariant.stock || 0);
        setQuantity(1); // Reset quantity when variant changes
      }
    }
  };

  const checkWishlistStatus = async (productId: number) => {
    try {
      const response = await wishlistService.checkWishlist(productId);
      setIsInWishlist(response.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast("Please login to add to wishlist", "error");
      navigate("/login");
      return;
    }

    if (!product) return;

    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.product_id);
        setIsInWishlist(false);
        showToast("Removed from wishlist", "success");
      } else {
        await wishlistService.addToWishlist(product.product_id);
        setIsInWishlist(true);
        showToast("Added to wishlist", "success");
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      if (error.message?.includes('already in wishlist')) {
        setIsInWishlist(true);
        showToast("Product already in wishlist", "info");
      } else {
        showToast("Error updating wishlist", "error");
      }
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
        variant_id: selectedVariant
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-6 mt-7">
          {/* <button
            onClick={() => navigate("/products")}
            className="flex items-center justify-items-end gap-2 mb-8 hover:text-red-500 cursor-pointer"
          >
            <Icon icon="lucide:arrow-left" />
            Back to Products
          </button> */}
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
                  ? `${product.image_url}`
                  : "/placeholder-image.jpg"
              }
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <Favorite
              onClick={toggleWishlist}
              sx={{
                color: isInWishlist ? "red" : "gray",
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
                ₹{Number(currentPrice || 0).toFixed(0)}
                {product.additional_info?.variants && currentPrice !== product.price && (
                  <span className="text-sm text-gray-400 ml-2 line-through">
                    ₹{Number(product.price || 0).toFixed(0)}
                  </span>
                )}
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selection */}
            {product.additional_info?.variant_fields && product.additional_info.variant_fields.length > 0 && (
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Select Options</h3>
                <div className="space-y-4">
                  {product.additional_info.variant_fields.map((field: any) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field.label}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {field.options.map((option: string) => (
                          <button
                            key={option}
                            onClick={() => handleVariantOptionChange(field.name, option)}
                            className={`px-4 py-2 rounded border transition-colors ${
                              selectedOptions[field.name] === option
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-gray-600 text-gray-300 hover:border-red-500'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {product.additional_info && Array.isArray(product.additional_info) && product.additional_info.length > 0 && (
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="space-y-3">
                  {product.additional_info.map((field: DynamicField) => (
                    <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-medium text-gray-300 min-w-[120px]">
                        {field.name}:
                      </span>
                      <span className="text-white">
                        {field.type === 'textarea' ? (
                          <div className="whitespace-pre-wrap">{field.value}</div>
                        ) : (
                          field.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span>Quantity:</span>
              <div className="flex items-center border border-gray-400 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-700 hover: cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-400 hover: cursor-pointer">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock, quantity + 1))
                  }
                  className="px-3 py-1 hover:bg-gray-700 hover: cursor-pointer"
                  disabled={quantity >= currentStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={currentStock === 0 ? undefined : handleAddToCart}
              disabled={currentStock === 0}
              className={`w-full py-3 rounded-md font-semibold transition-colors hover:cursor-pointer ${
                currentStock === 0
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {currentStock === 0 ? "Notify Me" : "Add to Cart"}
            </button>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};
