import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  
  // Address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // razorpay, cod
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchCartItems();
      // Pre-fill address if user has profile data
      if (user.name) {
        setShippingAddress(prev => ({ ...prev, fullName: user.name }));
      }
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

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
      if (response.data.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
      navigate('/cart');
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

  // Address form handlers
  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!shippingAddress[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Validate phone number
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate pincode
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep === 1 && !validateAddress()) {
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Place order
  const placeOrder = async () => {
    try {
      setProcessing(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const orderData = {
        shippingAddress,
        paymentMethod,
        orderNotes,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
      
      if (paymentMethod === 'razorpay') {
        // Integrate with Razorpay
        await handleRazorpayPayment(orderData, config);
      } else {
        // Cash on Delivery
        const response = await axios.post('/api/orders/create', orderData, config);
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data.id}`);
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Razorpay integration
  const handleRazorpayPayment = async (orderData, config) => {
    try {
      // Create Razorpay order
      const razorpayResponse = await axios.post('/api/payment/create-order', {
        amount: calculateTotal()
      }, config);
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // You'll need to add this to .env
        amount: razorpayResponse.data.amount,
        currency: razorpayResponse.data.currency,
        name: 'Harishma Sarees Zone',
        description: 'Order Payment',
        order_id: razorpayResponse.data.id,
        handler: async function (response) {
          try {
            // Verify payment and create order
            const verifyResponse = await axios.post('/api/payment/verify', {
              ...response,
              orderData
            }, config);
            
            toast.success('Payment successful! Order placed.');
            navigate(`/orders/${verifyResponse.data.orderId}`);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#7C2D12' // maroon-600
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      throw error;
    }
  };

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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-gray-600 hover:text-maroon-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Cart
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-500 mt-1">
                Complete your order
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Shipping', icon: MapPin },
              { step: 2, title: 'Payment', icon: CreditCard },
              { step: 3, title: 'Review', icon: CheckCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-maroon-600 border-maroon-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-maroon-600' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {step < 3 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    currentStep > step ? 'bg-maroon-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="House/Flat number, Building name"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="Street, Area, Colony (Optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      {/* Add more states as needed */}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => handleAddressChange('landmark', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                      placeholder="Nearby landmark (Optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Razorpay */}
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'razorpay' ? 'border-maroon-600 bg-maroon-50' : 'border-gray-200'
                  }`} onClick={() => setPaymentMethod('razorpay')}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="text-maroon-600 focus:ring-maroon-500"
                      />
                      <CreditCard className="h-5 w-5 text-maroon-600" />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-500">Pay securely with UPI, Cards, Net Banking</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cash on Delivery */}
                  <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cod' ? 'border-maroon-600 bg-maroon-50' : 'border-gray-200'
                  }`} onClick={() => setPaymentMethod('cod')}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-maroon-600 focus:ring-maroon-500"
                      />
                      <Truck className="h-5 w-5 text-maroon-600" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when your order is delivered</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Shipping Address Review */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-maroon-600 hover:text-maroon-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-medium">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                    {shippingAddress.landmark && <p>Landmark: {shippingAddress.landmark}</p>}
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-maroon-600 hover:text-maroon-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {paymentMethod === 'razorpay' ? (
                      <>
                        <CreditCard className="h-5 w-5 text-maroon-600" />
                        <span>Online Payment</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5 text-maroon-600" />
                        <span>Cash on Delivery</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items Review */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const imagePaths = getImagePaths(item.product);
                      return (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {imagePaths.length > 0 ? (
                              <img
                                src={imagePaths[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.warn('Checkout item image failed to load:', imagePaths[0]);
                                  if (e.target) {
                                    e.target.style.display = 'none';
                                  }
                                }}
                                onLoad={(e) => {
                                  if (e.target) {
                                    e.target.style.display = 'block';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatPrice(item.product.price * item.quantity)}</p>
                            <p className="text-sm text-gray-500">{formatPrice(item.product.price)} each</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={processing}
                  className="px-8 py-3 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
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

              {/* Security Features */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>Free Returns within 7 days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100% Authentic Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
