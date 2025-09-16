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
  additional_info?: any;
  total_variant_stock?: number;
}

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  cartQuantity: number;
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  variants: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInWishlist,
  cartQuantity,
  onToggleWishlist,
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
                product.image_url ? product.image_url : "/placeholder-image.jpg"
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/product/${product.product_id}`)}
            />
            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-sm heading-font">
              {product.category}
            </div>
            <Favorite
              onClick={() => onToggleWishlist(product.product_id)}
              sx={{
                color: isInWishlist ? "red" : "white",
                cursor: "pointer",
                zIndex: 10,
              }}
              className="absolute top-2 right-2"
            />
          </div>
          <div className="p-4 ">
            <h3
              className="heading-font text-lg mb-1 line-clamp-2 cursor-pointer hover:text-red-500"
              onClick={() => navigate(`/product/${product.product_id}`)}
            >
              {product.name}
            </h3>
            <p className="text-sm text-foreground/70 mb-2 line-clamp-2 font-sans truncate w-4/5 inline-block">
              {product.description}
            </p>
            <div className="flex justify-between items-center mb-3">
              <p className="text-primary font-bold font-mono">
                ₹{product.price}
              </p>
            </div>
            {cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2 gap-2">
                <button
                  className="hover:text-red-500 p-1 border border-gray-400 rounded-sm"
                  onClick={() =>
                    onUpdateQuantity(product.product_id, cartQuantity - 1)
                  }
                >
                  <Icon icon="lucide:minus" />
                </button>
                <span className="font-mono text-lg font-bold px-28 md:px-12 xl:px-16 rounded-md border border-gray-400">
                  {cartQuantity}
                </span>
                <button
                  className="hover:text-red-500 p-1 border border-gray-400 rounded-sm"
                  disabled={cartQuantity >= (product.additional_info?.variants ? 
                    (product.total_variant_stock || 0) : product.stock)}
                  onClick={() =>
                    onUpdateQuantity(product.product_id, cartQuantity + 1)
                  }
                >
                  <Icon icon="lucide:plus" />
                </button>
              </div>
            ) : (
              <button
                style={{ width: "100%" }}
                className={`heading-font tracking-wider text-sm p-3 rounded-md cursor-pointer ${
                  (product.additional_info?.variants ? 
                    (product.total_variant_stock || 0) === 0 : product.stock === 0) 
                    ? 'bg-gray-600 text-gray-300' 
                    : 'bg-red-600'
                }`}
                onClick={() => {
                  const hasStock = product.additional_info?.variants ? 
                    (product.total_variant_stock || 0) > 0 : product.stock > 0;
                  if (hasStock) {
                    // For variant products, navigate to detail page for selection
                    if (product.additional_info?.variants) {
                      window.location.href = `/product/${product.product_id}`;
                    } else {
                      onAddToCart(product.product_id);
                    }
                  }
                }}
                disabled={(product.additional_info?.variants ? 
                  (product.total_variant_stock || 0) === 0 : product.stock === 0)}
              >
                {(product.additional_info?.variants ? 
                  (product.total_variant_stock || 0) === 0 : product.stock === 0) 
                  ? 'NOTIFY ME' 
                  : (product.additional_info?.variants ? 'SELECT OPTIONS' : 'ADD TO CART')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};