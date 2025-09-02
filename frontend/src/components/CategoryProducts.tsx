import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService, cartService, API_BASE_URL } from '../services';

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  stock: number;
}

export const CategoryProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

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
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      showToast('Error adding to cart', 'error');
    }
  };

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProductsByCategory(category!);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="heading-font text-3xl md:text-4xl mb-4">
              {category} <span className="text-primary">PRODUCTS</span>
            </h1>
            <div className="samurai-divider w-24 mb-6"></div>
          </div>
          <Button
            variant="flat"
            onPress={() => navigate('/')}
            startContent={<Icon icon="lucide:arrow-left" />}
          >
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <Icon icon="lucide:package-x" className="h-16 w-16 text-foreground/50 mx-auto mb-4" />
            <p className="text-foreground/70">No products available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};