import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Heart,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get('/api/cart', config);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view your cart');
        navigate('/login');
      } else {
        toast.error('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get image paths
  const getImagePaths = (product) => {
    if (!product?.imagePaths) return [];
    try {
      return JSON.parse(product.imagePaths);
    } catch (error) {
      return product.imagePath ? [product.imagePath] : [];
    }
  };

  // Update quantity
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(prev => ({ ...prev, [cartId]: true }));
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.put(`/api/cart/update/${cartId}?quantity=${newQuantity}`, {}, config);
      
      // Update local state
      setCartItems(prev => prev.map(item => 
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      ));
      
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Failed to update cart');
      } else {
        toast.error('Failed to update cart');
      }
    } finally {
      setUpdating(prev => ({ ...prev, [cartId]: false }));
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/cart/remove/${cartId}`, config);
      
      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== cartId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.delete('/api/cart/clear', config);
      setCartItems([]);
      setShowClearConfirm(false);
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Add to wishlist
  const addToWishlist = (product) => {
    // TODO: Implement wishlist functionality
    toast.success(`${product.name} added to wishlist!`);
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to login to view your shopping cart</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-maroon-600 text-white px-6 py-3 rounded-lg hover:bg-maroon-700 transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-maroon-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-maroon-600 text-white px-6 py-3 rounded-lg hover:bg-maroon-700 transition-colors inline-flex items-center space-x-2"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        ) : (
          // Cart Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const imagePaths = getImagePaths(item.product);
                const isUpdating = updating[item.id];
                
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        {imagePaths.length > 0 ? (
                          <img
                            src={imagePaths[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.warn('Cart item image failed to load:', imagePaths[0]);
                              if (e.target) {
                                e.target.style.display = 'none';
                                const placeholder = e.target.nextSibling;
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }
                            }}
                            onLoad={(e) => {
                              if (e.target) {
                                e.target.style.display = 'block';
                                const placeholder = e.target.nextSibling;
                                if (placeholder) {
                                  placeholder.style.display = 'none';
                                }
                              }
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              <button
                                onClick={() => navigate(`/products/${item.product.id}`)}
                                className="hover:text-maroon-600 transition-colors text-left"
                              >
                                {item.product.name}
                              </button>
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{item.product.category}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {item.product.color && <span>Color: {item.product.color}</span>}
                              {item.product.size && <span>Size: {item.product.size}</span>}
                            </div>
                            
                            {/* Stock Warning */}
                            {item.product.stock < 10 && (
                              <div className="flex items-center space-x-1 mt-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-orange-600">
                                  Only {item.product.stock} left in stock
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => addToWishlist(item.product)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Add to Wishlist"
                            >
                              <Heart className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove from Cart"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">Quantity:</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-lg font-semibold w-8 text-center">
                                {isUpdating ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock || isUpdating}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-maroon-600">
                              {formatPrice(item.product.price * item.quantity)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.product.price)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {calculateShipping(calculateSubtotal()) === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(calculateShipping(calculateSubtotal()))
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-medium">{formatPrice(calculateTax(calculateSubtotal()))}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-maroon-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {calculateShipping(calculateSubtotal()) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800">
                      Add {formatPrice(500 - calculateSubtotal())} more for free shipping!
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-maroon-600 text-white py-3 px-6 rounded-lg hover:bg-maroon-700 transition-colors font-semibold"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear Cart</h3>
                <p className="text-sm text-gray-600">Are you sure you want to remove all items from your cart?</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearCart}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
