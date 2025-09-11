import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { wishlistService, cartService } from '../services';
import { Navbar } from '../components/Navbar';

interface WishlistItem {
  wishlist_id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  category_name: string;
}

export const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlistItems(data);
    } catch (error) {
      showToast('Error fetching wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      showToast('Error removing from wishlist', 'error');
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      showToast('Error adding to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="heading-font text-3xl md:text-4xl mb-4">
              MY <span className="text-primary">WISHLIST</span>
            </h1>
            <div className="samurai-divider w-24"></div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-20">
              <Icon icon="lucide:heart" className="h-16 w-16 text-foreground/50 mx-auto mb-4" />
              <p className="text-foreground/70 mb-4">Your wishlist is empty</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.wishlist_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-content1 border border-primary/20 rounded-lg overflow-hidden hover:border-primary/40 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={item.image_url || '/placeholder-image.jpg'}
                      alt={item.name}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => navigate(`/product/${item.product_id}`)}
                    />
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <Icon icon="lucide:heart" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-primary mb-1">{item.category_name}</p>
                    <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                    <p className="text-lg font-bold text-primary mb-3">₹{item.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.stock === 0}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
                      >
                        {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};