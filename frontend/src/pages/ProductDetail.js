import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Award
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setSelectedSize(response.data.size || '');
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        toast.error('Product not found');
        navigate('/products');
      } else {
        toast.error('Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      // Fetch products from the same category
      const response = await axios.get(`/api/products?size=4&page=0`);
      setRelatedProducts(response.data.content.filter(p => p.id !== parseInt(id)));
    } catch (error) {
      console.error('Error fetching related products:', error);
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

  // Image navigation
  const nextImage = () => {
    const imagePaths = getImagePaths(product);
    setCurrentImageIndex((prev) => (prev + 1) % imagePaths.length);
  };

  const prevImage = () => {
    const imagePaths = getImagePaths(product);
    setCurrentImageIndex((prev) => prev === 0 ? imagePaths.length - 1 : prev - 1);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Product actions
  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.post(`/api/cart/add?productId=${product.id}&quantity=${quantity}`, {}, config);
      toast.success(`${quantity} ${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Failed to add to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    // TODO: Implement buy now functionality
    toast.success('Redirecting to checkout...');
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <button
              onClick={() => navigate('/products')}
              className="bg-maroon-600 text-white px-6 py-3 rounded-lg hover:bg-maroon-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imagePaths = getImagePaths(product);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => navigate('/')}
              className="hover:text-maroon-600"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/products')}
              className="hover:text-maroon-600"
            >
              Products
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/products?category=${product.category}`)}
              className="hover:text-maroon-600"
            >
              {product.category}
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-maroon-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-square">
              {imagePaths.length > 0 ? (
                <>
                  <img
                    src={imagePaths[currentImageIndex]}
                    alt={`${product.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Product detail image failed to load:', imagePaths[currentImageIndex]);
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
                  <div className="hidden w-full h-full bg-gray-200 items-center justify-center">
                    <span className="text-gray-500">Image Not Available</span>
                  </div>

                  {/* Navigation Arrows */}
                  {imagePaths.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {imagePaths.length}
                      </div>
                    </>
                  )}

                  {/* Featured Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-4 left-4 bg-maroon-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {imagePaths.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {imagePaths.map((imagePath, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-maroon-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imagePath}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn('Product thumbnail failed to load:', imagePath);
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
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.category}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-maroon-600">{formatPrice(product.price)}</span>
                {/* TODO: Add original price and discount if applicable */}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">
                      {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left!`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.color && (
                  <div>
                    <span className="text-gray-500">Color:</span>
                    <span className="ml-2 font-medium">{product.color}</span>
                  </div>
                )}
                {product.fabric && (
                  <div>
                    <span className="text-gray-500">Fabric:</span>
                    <span className="ml-2 font-medium">{product.fabric}</span>
                  </div>
                )}
                {product.size && (
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="ml-2 font-medium">{product.size}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{product.category}</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-500 ml-4">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-maroon-600 text-white py-3 px-6 rounded-lg hover:bg-maroon-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToWishlist}
                  className={`flex-1 py-3 px-6 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-maroon-600" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-maroon-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-maroon-600" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-maroon-600" />
                  <span>Quality Assured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const relatedImagePaths = getImagePaths(relatedProduct);
                return (
                  <div
                    key={relatedProduct.id}
                    onClick={() => navigate(`/products/${relatedProduct.id}`)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                  >
                    <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      {relatedImagePaths.length > 0 ? (
                        <img
                          src={relatedImagePaths[0]}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.warn('Related product image failed to load:', relatedImagePaths[0]);
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
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                      {relatedProduct.isFeatured && (
                        <div className="absolute top-2 left-2 bg-maroon-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{relatedProduct.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-maroon-600">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`${relatedProduct.name} added to cart!`);
                          }}
                          className="bg-maroon-600 text-white px-3 py-1 rounded hover:bg-maroon-700 transition-colors text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
