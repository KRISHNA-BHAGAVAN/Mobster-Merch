import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { productService, cartService, API_BASE_URL } from '../services';
import { FloatingCart } from './FloatingCart';

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

export const AllProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  const handleAddToCart = (productId: number) => {
    if (isAuthenticated) {
      addToCart(productId);
    } else {
      navigate('/login');
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await cartService.addToCart({ product_id: productId, quantity: 1 });
      await Promise.all([fetchCartItems(), refreshCart()]);
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('Error adding to cart', 'error');
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(productId);
      return;
    }
    
    // Check stock limit
    const product = products.find(p => p.product_id === productId);
    if (product && newQuantity > product.stock) {
      showToast(`Only ${product.stock} items available in stock`, 'error');
      return;
    }
    
    try {
      await cartService.updateQuantity(productId, newQuantity);
      await Promise.all([fetchCartItems(), refreshCart()]);
    } catch (error) {
      showToast('Error updating quantity', 'error');
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await cartService.removeByProductId(productId);
      await Promise.all([fetchCartItems(), refreshCart()]);
    } catch (error) {
      showToast('Error removing from cart', 'error');
    }
  };

  const getCartQuantity = (productId: number): number => {
    const item = cartItems.find(item => item.product_id === productId);
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
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const data = await cartService.getCart();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Filtered products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

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
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Icon icon="lucide:search" className="text-black" />}
            className="w-full md:w-80"
            classNames={{
              inputWrapper: "bg-white",
              input: "!text-black !placeholder-black",
            }}
          />

          <Button
            variant="flat"
            onPress={() => navigate('/')}
            startContent={<Icon icon="lucide:arrow-left" />}
          >
            Back to Home
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.product_id}
              className="product-card bg-content1 border border-primary/20 transition-all duration-300"
            >
              <CardBody className="p-0 overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={product.image_url ? `${API_BASE_URL.replace('/api', '')}${product.image_url}` : '/placeholder-image.jpg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-sm heading-font">
                    {product.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="heading-font text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-foreground/70 mb-2 line-clamp-2 font-sans">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-primary font-bold font-mono">₹{product.price}</p>
                    <p className="text-xs text-foreground/60">Stock: {product.stock}</p>
                  </div>
                  {getCartQuantity(product.product_id) > 0 ? (
                    <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => updateQuantity(product.product_id, getCartQuantity(product.product_id) - 1)}
                      >
                        <Icon icon="lucide:minus" />
                      </Button>
                      <span className="font-mono text-lg font-bold px-4">
                        {getCartQuantity(product.product_id)}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        isDisabled={getCartQuantity(product.product_id) >= product.stock}
                        onPress={() => updateQuantity(product.product_id, getCartQuantity(product.product_id) + 1)}
                      >
                        <Icon icon="lucide:plus" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      color="primary" 
                      variant="flat" 
                      fullWidth
                      className="heading-font tracking-wider text-sm"
                      startContent={<Icon icon="lucide:shopping-cart" />}
                      onPress={() => handleAddToCart(product.product_id)}
                    >
                      ADD TO CART
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Icon icon="lucide:package-x" className="h-16 w-16 text-foreground/50 mx-auto mb-4" />
            <p className="text-foreground/70">No products found</p>
          </div>
        )}
      </div>
      <FloatingCart />
    </div>
  );
};
