import React, { useState, useEffect } from "react";

import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { cartService, orderService, API_BASE_URL } from "../services";

interface CartItem {
  cart_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  subtotal: number;
  stock: number;
}

export const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshCart } = useCart();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      console.log("Cart data:", data);
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    cartId: number,
    quantity: number,
    maxStock: number
  ) => {
    if (quantity < 1) {
      try{
        await cartService.removeFromCart(cartId);
        await Promise.all([fetchCart(), refreshCart()]);
      } catch (error) {
        console.error("Error removing item:", error);
      }
      return;
    }
    if (quantity > maxStock) {
      showToast(`Only ${maxStock} items available in stock`, "error");
      return;
    }

    try {
      await cartService.updateCartItem(cartId, quantity);
      await Promise.all([fetchCart(), refreshCart()]);
    } catch (error) {
      console.error("Error updating quantity:", error);
      showToast("Error updating quantity", "error");
    }
  };

  const removeItem = async (cartId: number) => {
    try {
      await cartService.removeFromCart(cartId);
      await Promise.all([fetchCart(), refreshCart()]);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

    const checkout = () => {
    navigate('/checkout');
    }

  const total = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="lucide:loader-2" className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-font text-3xl">Shopping Cart</h1>
            <div className="samurai-divider w-24 mb-6"></div>
          </div>

          <div className="flex justify-end mb-6 mt-7">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center justify-items-end gap-2 mb-8 hover:text-red-500 cursor-pointer"
            >
              <Icon icon="lucide:arrow-left" />
              Continue Shopping
            </button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <Icon
              icon="lucide:shopping-cart"
              className="h-16 w-16 text-foreground/50 mx-auto mb-4"
            />
            <p className="text-foreground/70 mb-4">Your cart is empty</p>
            <button onClick={() => navigate("/products")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.cart_id}>
                  <div className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={
                          item.image_url
                            ? `${API_BASE_URL.replace("api", "")}${
                                item.image_url
                              }`
                            : "/placeholder.jpg"
                        }
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-primary font-mono">₹{item.price}</p>
                        <p className="text-xs text-foreground/60">
                          Stock: {item.stock}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className="bg-red-800 text-white hover:bg-red-700 cursor-pointer px-3 py-1 text-xl"
                            onClick={() =>
                              updateQuantity(
                                item.cart_id,
                                item.quantity - 1,
                                item.stock
                              )
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity.toString()}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              updateQuantity(
                                item.cart_id,
                                newQuantity,
                                item.stock
                              );
                            }}
                            className="w-20 text-center bg-black border border-gray-600 rounded text-white font-semibold text-lg focus:border-primary [-webkit-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <button
                            className="bg-red-800 text-white hover:bg-red-700 cursor-pointer px-3 py-1 text-xl"
                            onClick={() =>
                              updateQuantity(
                                item.cart_id,
                                item.quantity + 1,
                                item.stock
                              )
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                          <button onClick={() => removeItem(item.cart_id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button style={{ width: "100%" }} onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
