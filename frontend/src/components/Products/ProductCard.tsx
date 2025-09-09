import React from 'react';
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
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

interface ProductCardProps {
  product: Product;
  favorites: Set<number>;
  cartQuantity: number;
  onToggleFavorite: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  variants: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  favorites,
  cartQuantity,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  variants
}) => {
  const navigate = useNavigate();

  return (
    <motion.div variants={variants}>
      <div className="product-card bg-content1 border border-red-500 hover:border-none rounded-md overflow-hidden transition-all duration-300 h-full">
        <div className="p-0 overflow-hidden">
          <div className="relative aspect-[10/8] overflow-hidden">
            <img
              src={
                product.image_url
                  ? product.image_url
                  : "/placeholder-image.jpg"
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/product/${product.product_id}`)}
            />
            <div>
              <Favorite
                onClick={() => onToggleFavorite(product.product_id)}
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
            {cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2 gap-2">
                <button
                  className="hover:text-red-500 p-1 border border-gray-400 rounded-sm"
                  onClick={() => onUpdateQuantity(product.product_id, cartQuantity - 1)}
                >
                  <Icon icon="lucide:minus" />
                </button>
                <span className="font-mono text-lg font-bold px-28 md:px-12 xl:px-16 rounded-md border border-gray-400">
                  {cartQuantity}
                </span>
                <button
                  className="hover:text-red-500 p-1 border border-gray-400 rounded-sm"
                  disabled={cartQuantity >= product.stock}
                  onClick={() => onUpdateQuantity(product.product_id, cartQuantity + 1)}
                >
                  <Icon icon="lucide:plus" />
                </button>
              </div>
            ) : (
              <button
                style={{ width: "100%" }}
                className="heading-font tracking-wider text-sm bg-red-600 p-3 rounded-md cursor-pointer"
                onClick={() => onAddToCart(product.product_id)}
              >
                ADD TO CART
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};