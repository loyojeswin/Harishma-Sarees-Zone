import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchCartCount();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await axios.get('/api/cart/count');
      setCartCount(response.data);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      const response = await axios.post('/api/cart/add', null, {
        params: { productId, quantity }
      });
      
      toast.success('Product added to cart');
      await fetchCartItems();
      await fetchCartCount();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateCartItem = async (cartId, quantity) => {
    try {
      await axios.put(`/api/cart/update/${cartId}`, null, {
        params: { quantity }
      });
      
      await fetchCartItems();
      await fetchCartCount();
      toast.success('Cart updated');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await axios.delete(`/api/cart/remove/${cartId}`);
      
      await fetchCartItems();
      await fetchCartCount();
      toast.success('Item removed from cart');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      
      setCartItems([]);
      setCartCount(0);
      toast.success('Cart cleared');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    fetchCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
